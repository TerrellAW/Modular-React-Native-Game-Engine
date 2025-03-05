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
  {
    // Ceiling
    type: "ceiling",
    width: screenWidth,
    height: 1,
    x: 0,
    y: 0,
  },
  {
    // Left wall
    type: "wall",
    width: 1,
    height: screenHeight,
    x: 0,
    y: 0,
  },
  {
    // Right wall
    type: "wall",
    width: 1,
    height: screenHeight,
    x: screenWidth - 1,
    y: 0,
  },
];

// Collision handler
export const handleCollision = (
  box,
  velocityXRef,
  velocityYRef,
  positionXRef,
  positionYRef,
  playerBox
) => {
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
      break;

    case "wall":
      // Bounce horizontally off wall
      if (velocityXRef.current > 0) {
        velocityXRef.current = -velocityXRef.current * bounceFactor; // Reverse horizontal velocity and reduce by bounce factor
        positionXRef.setValue(
          box.x - (playerBox.width + gapSize) // 1 pixel to the left of wall by default
        ); // Set player position to the left of wall
      } else if (velocityXRef.current < 0) {
        velocityXRef.current = -velocityXRef.current * bounceFactor; // Reverse horizontal velocity and reduce by bounce factor
        positionXRef.setValue(
          box.x + (playerBox.width + gapSize) // 1 pixel to the right of wall by default
        ); // Set player position to the right of wall
      }
      break;
  }
};
