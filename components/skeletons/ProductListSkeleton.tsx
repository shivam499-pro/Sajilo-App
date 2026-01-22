import { View, StyleSheet } from "react-native";

export default function ProductListSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((_, index) => (
        <View key={index} style={styles.card} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  card: {
    width: "45%",
    height: 140,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 15,
  },
});
