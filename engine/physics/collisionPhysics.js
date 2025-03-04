import { Dimensions, Platform } from "react-native";

// Configuration files
import gapConfig from "../config/gapConfig";

// Gap size between floor and player (Platform specific)
const gapSize = Platform.OS === "web" ? gapConfig.web : gapConfig.default;

// Screen dimensions
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

// Floor height
const floorHeight = 100;

// Environment collision boxes
export const collisionBoxes = [
  {
    // Floor
    type: "floor",
    width: screenWidth,
    height: floorHeight,
    x: 0,
    y:
      screenHeight -
      (floorHeight - (Platform.OS === "android" ? 25 : -gapSize)), // Subtract by 25 if Android and add gapSize if on PC
  },
];

// Collision handler
export const handleCollision = (box, velocityYRef, positionYRef, playerBox) => {
  // Bounce multiplier (0.2 means 20% of velocity goes into bounce)
  const bounceFactor = 0.2;

  switch (box.type) {
    // Calculate bounce based on collision type
    case "floor":
      // Bounce vertically off floor
      if (velocityYRef.current > 0) {
        velocityYRef.current = -velocityYRef.current * bounceFactor; // Reverse vertical velocity and reduce by bounce factor
        positionYRef.setValue(
          box.y - (playerBox.height + gapSize) // 1 pixel above floor by default
        ); // Set player position above floor
      }

      // Settle if velocity is low enough
      if (Math.abs(velocityYRef.current) < 0.5) {
        velocityYRef.current = 0;
        positionYRef.setValue(
          box.y - (playerBox.height + gapSize) // 1 pixel above floor by default
        ); // Set player position above floor
      }
      break;

    case "ceiling":
      // Bounce vertically off ceiling
      if (velocityYRef.current < 0) {
        velocityYRef.current = -velocityYRef.current * bounceFactor; // Reverse vertical velocity and reduce by bounce factor
        positionYRef.setValue(
          box.y + (playerBox.height + gapSize) // 1 pixel below ceiling by default
        ); // Set player position below ceiling
      }

    //case "wall":
    // Bounce horizontally off wall
  }
};
