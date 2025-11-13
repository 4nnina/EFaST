import axios from "axios";

export async function runOptimization() {
  try {
    const res = await axios.post(`http://localhost:5000/runOptimization`);
    return res.data;
  } catch (error: any) {
    console.error("Errore durante l'avvio dell'ottimizzazione:", error);
    return {
      status: "error",
      message: error.response?.data?.message || error.message,
    };
  }
}

export async function stopOptimization() {
  try {
    const res = await axios.post("http://localhost:5000/stopOptimization");
    return res.data;
  } catch (error: any) {
    console.error("Errore durante l'arresto dell'ottimizzazione:", error);
    return {
      status: "error",
      message: error.response?.data?.message || error.message,
    };
  }
}

export async function getJsonFiles() {
  try {
    const res = await axios.get("http://localhost:5000/getJsonFiles");
    return res.data;
  } catch (error: any) {
    console.error("Errore nel recupero dei file JSON:", error);
    return [];
  }
}

