const { predictClassification } = require('../services/inferenceService');
const { Firestore } = require('@google-cloud/firestore');
const storeData = require('../services/storeData');
const crypto = require('crypto');

async function postPredictHandler(request, h) {

  const { image } = request.payload;
  const { model } = request.server.app;

  const { predictedClassName, suggestion } = await predictClassification(model, image);

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    "id": id,
    "result": predictedClassName,
    "suggestion": suggestion,
    "createdAt": createdAt
  }

  await storeData(id, data);

  const response = h.response({
    status: 'success',
    message: 'Model is predicted successfully',
    data
  })
  response.code(201);
  return response;
}


async function getHistory(request, h) {
  
  try {

    const db = new Firestore();
    const predictRef = await db.collection('prediction').get();
    const predictData = [];
    predictRef.forEach((doc) =>{
      const dataPredict = doc.data();
      predictData.push({
        id: doc.id,
        history:{
          result:dataPredict.result,
          createdAt: dataPredict.createdAt, 
          suggestion: dataPredict.suggestion, 
          id: dataPredict.id 
        }
      });
    });

    const response = h.response({
      status:'success',
      data:predictData
    });
    response.code(200);
    return response;

  } catch(err){

    console.log('Error fetching proggress:', err);
    const response = h.response({
      status:'error',
      message:'Terjadi Kesalahan saat mengambil data predicts'
    });
    response.code(500);
    return response;
  }

}

module.exports = { postPredictHandler, getHistory };