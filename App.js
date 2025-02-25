import { SafeAreaView } from "react-native";

import Physics from "./components/Physics";

export default function App() {
  return (
    <SafeAreaView
      style={{
          flex: 1,
        }}
    >     
      <Physics />
    </SafeAreaView>
  );
}