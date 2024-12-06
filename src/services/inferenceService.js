const tf = require("@tensorflow/tfjs-node");
const InputError = require("../exceptions/InputError");

async function predictClassification(model, image) {
  try {
    const tensor = tf.node.decodeJpeg(image).resizeNearestNeighbor([224, 224]).expandDims().toFloat();

    const prediction = model.predict(tensor);
    const scores = await prediction.data();
    const cancerProbability = Math.max(...scores) * 100;

    let predictedClassName;
    let suggestion;

    if (cancerProbability > 50) {
      predictedClassName = "Cancer";
      suggestion = "Segera periksa ke dokter!";
    } else {
      predictedClassName = "Non-cancer";
      suggestion = "Penyakit kanker tidak terdeteksi.";
    }

    return { predictedClassName, suggestion };
  } catch (error) {
    throw new InputError();
  }
}

module.exports = { predictClassification };
