export const handleTouch = (
  event,
  positionXRef,
  positionYRef,
  velocityXRef,
  velocityYRef,
  playerBox
) => {
  console.log("Touch event detected");
  // Get touch coords
  const touchX = event.nativeEvent.pageX;
  const touchY = event.nativeEvent.pageY;

  // Get player coords
  const playerCenterX = positionXRef._value + playerBox.width / 2;
  const playerCenterY = positionYRef._value + playerBox.height / 2;

  // Calculate distance between touch and player center
  const distanceX = playerCenterX - touchX;
  const distanceY = playerCenterY - touchY;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  console.log("Touch coords:", touchX, touchY);
  console.log("Player center:", playerCenterX, playerCenterY);
  console.log("Distance:", distance);

  // Define max range and force
  const maxRange = 100;
  const maxForce = 15;

  // Apply force if within range and based on distance
  if (distance < maxRange) {
    const force = maxForce * (1 - distance / maxRange);
    velocityXRef.current += (distanceX / distance) * force;
    velocityYRef.current += (distanceY / distance) * force;
    console.log("Force applied:", force);
    console.log(
      "Velocity after force:",
      velocityXRef.current,
      velocityYRef.current
    );
  }
};
