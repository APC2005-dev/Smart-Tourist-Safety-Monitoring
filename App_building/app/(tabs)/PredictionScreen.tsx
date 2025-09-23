// import React, { useState } from "react";
// import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";

// export default function PredictionScreen() {
//   const [inputData, setInputData] = useState(""); // JSON array as string
//   const [result, setResult] = useState<any>(null);
//   const [loading, setLoading] = useState(false);

//   const handlePredict = async () => {
//     try {
//       setLoading(true);
//       const parsedData = JSON.parse(inputData);

//       const response = await fetch("http://192.168.29.29:8000/predict", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ data: parsedData }),
//       });

//       const resJson = await response.json();
//       setResult(resJson);
//     } catch (error) {
//       console.error(error);
//       setResult({ error: "Invalid input or API error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.heading}>Activity Prediction</Text>
//       <Text style={styles.label}>Enter Sensor Data (2D JSON Array):</Text>
//       <TextInput
//         style={styles.input}
//         multiline
//         numberOfLines={8}
//         placeholder='[[0.1, 0.2, ...], [0.3, 0.5, ...], ...]'
//         value={inputData}
//         onChangeText={setInputData}
//       />
//       <Button title={loading ? "Predicting..." : "Predict"} onPress={handlePredict} disabled={loading} />
      
//       {result && (
//         <View style={styles.resultBox}>
//           <Text style={styles.resultText}>
//             {result.error
//               ? `Error: ${result.error}`
//               : `Prediction: ${result.predicted_label} (Conf: ${(result.confidence * 100).toFixed(2)}%)`}
//           </Text>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 16, backgroundColor: "#f8f8f8" },
//   heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
//   label: { fontSize: 16, marginBottom: 8 },
//   input: { backgroundColor: "#fff", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "#ccc" },
//   resultBox: { marginTop: 16, padding: 12, backgroundColor: "#eafaf1", borderRadius: 8 },
//   resultText: { fontSize: 16, fontWeight: "bold" }
// });



import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";

export default function PredictionScreen() {
  const [inputData, setInputData] = useState(""); // JSON array as string
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    try {
      setLoading(true);
      const parsedData = JSON.parse(inputData);

      const response = await fetch("http://192.168.29.29:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsedData }),
      });

      const resJson = await response.json();
      setResult(resJson);
    } catch (error) {
      console.error(error);
      setResult({ error: "Invalid input or API error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Activity Prediction</Text>
      <Text style={styles.label}>Enter Sensor Data (2D JSON Array):</Text>

      <ScrollView style={styles.inputWrapper} nestedScrollEnabled>
        <TextInput
          style={styles.input}
          multiline
          scrollEnabled
          textAlignVertical="top"
          placeholder='[[0.1, 0.2, ...], [0.3, 0.5, ...], ...]'
          value={inputData}
          onChangeText={setInputData}
        />
      </ScrollView>

      <Button
        title={loading ? "Predicting..." : "Predict"}
        onPress={handlePredict}
        disabled={loading}
      />

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>
            {result.error
              ? `Error: ${result.error}`
              : `Prediction: ${result.predicted_label}`}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: "#f8f8f8" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 16, marginBottom: 8 },
  inputWrapper: {
    maxHeight: 400,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "monospace",
    minHeight: 200,
  },
  resultBox: { marginTop: 16, padding: 12, backgroundColor: "#eafaf1", borderRadius: 8 },
  resultText: { fontSize: 16, fontWeight: "bold" },
});