import { SafeAreaView } from "react-native";

import Engine from "./engine/Engine";

export default function App() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <Engine />
    </SafeAreaView>
  );
}
