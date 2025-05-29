import { classNames } from "shared/lib/classNames/classNames";

describe("classNames", () => {
  test("with only first param", () => {
    expect(classNames("someClass")).toBe("someClass");
  });

  test("with additional class", () => {
    const expected = "someClass cls1 cls2";
    expect(classNames("someClass", {}, ["cls1", "cls2"])).toBe(expected);
  });

  test("with mods", () => {
    const expected = "someClass cls1 cls2 hovered scrollable";
    expect(
      classNames(
        "someClass",
        {
          hovered: true,
          scrollable: true,
          selected: false,
        },
        ["cls1", "cls2"],
      ),
    ).toBe(expected);
  });
});
