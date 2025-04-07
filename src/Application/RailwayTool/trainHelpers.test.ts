import { getTrainType } from "./trainHelpers";

describe("getTrainType", () => {
  it("should return the correct train type", () => {
    expect(getTrainType("G4002")).toBe("高速动车组旅客列车（G）: 直通临客预留");
    expect(getTrainType("D8999")).toBe("动车组旅客列车（D）: 管内图定");
    expect(getTrainType("1002")).toBe("普通旅客快车（普快）: 跨三局及其以上");
    expect(getTrainType("6202")).toBe("普通旅客列车（普客）: 管内");
  });
});
