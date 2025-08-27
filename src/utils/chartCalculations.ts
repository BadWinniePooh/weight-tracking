// Chart calculation utilities for testing
export const calculateFloorLine = (
  dailyAverages: Array<{ date: string; value: number }>,
  settings: { weightGoal: number; lossRate: number; bufferValue: number },
) => {
  if (dailyAverages.length < 7) return [];

  // Calculate starting value (average of first 6 days)
  const first6DaysData = dailyAverages.slice(0, 6);
  const sumFirst6Days = first6DaysData.reduce(
    (sum, day) => sum + day.value,
    0,
  );
  const startValue = sumFirst6Days / 6;

  // Initialize result with empty values for the first 6 days
  const result: Array<number | null> = Array(6).fill(null);

  // Calculate floor value for day 7
  const day7FloorValue = startValue - startValue * settings.bufferValue * 0.5;
  result.push(day7FloorValue);

  // Calculate remaining floor values
  let previousFloor = day7FloorValue;

  for (let i = 7; i < dailyAverages.length; i++) {
    const newFloor =
      previousFloor -
      (previousFloor - settings.weightGoal) * settings.lossRate;
    result.push(newFloor);
    previousFloor = newFloor;
  }

  return result;
};

export const calculateCeilingLine = (
  dailyAverages: Array<{ date: string; value: number }>,
  settings: {
    weightGoal: number;
    lossRate: number;
    bufferValue: number;
    carbFatRatio: number;
  },
) => {
  if (dailyAverages.length < 7) return [];

  // Calculate starting value (average of first 6 days)
  const first6DaysData = dailyAverages.slice(0, 6);
  const sumFirst6Days = first6DaysData.reduce(
    (sum, day) => sum + day.value,
    0,
  );
  const startValue = sumFirst6Days / 6;

  // Initialize result with empty values for the first 6 days
  const result: Array<number | null> = Array(6).fill(null);

  // Calculate ceiling value for day 7
  const day7CeilingValue =
    startValue + startValue * settings.bufferValue * 0.5;
  result.push(day7CeilingValue);

  // Calculate remaining ceiling values
  let previousCeiling = day7CeilingValue;

  for (let i = 7; i < dailyAverages.length; i++) {
    const adjustedGoal =
      settings.weightGoal + settings.weightGoal * settings.bufferValue;
    const newCeiling =
      previousCeiling -
      (previousCeiling - adjustedGoal) *
        settings.lossRate *
        settings.carbFatRatio;
    result.push(newCeiling);
    previousCeiling = newCeiling;
  }

  return result;
};

export const calculateIdealLine = (
  floorData: Array<number | null>,
  ceilingData: Array<number | null>,
) => {
  if (floorData.length !== ceilingData.length) return [];

  return floorData.map((floor, index) => {
    const ceiling = ceilingData[index];
    if (floor === null || ceiling === null) return null;
    return (floor + ceiling) / 2;
  });
};