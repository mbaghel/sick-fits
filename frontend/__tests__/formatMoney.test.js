import formatMoney from "../lib/formatMoney";

describe("formatMoney function", () => {
  it("works with fractional dollars", () => {
    expect(formatMoney(1)).toBe("$0.01");
    expect(formatMoney(99)).toBe("$0.99");
    expect(formatMoney(20)).toBe("$0.20");
  });
  it("leaves off cents on whole dollar amounts", () => {
    expect(formatMoney(100)).toBe("$1");
    expect(formatMoney(3000)).toBe("$30");
  });
  it("works with combined whole and fractional amounts", () => {
    expect(formatMoney(111)).toBe("$1.11");
    expect(formatMoney(101)).toBe("$1.01");
    expect(formatMoney(9999999)).toBe("$99,999.99");
  });
});
