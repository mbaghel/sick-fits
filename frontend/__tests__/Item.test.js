import { shallow } from "enzyme";
import toJSON from "enzyme-to-json";
import ItemComponent from "../components/Item";

const fakeItem = {
  id: "ABC123",
  title: "A big dog",
  price: 10001,
  description: "This dog is sooo big",
  image: "/image.jpg",
  largeImage: "/largeImage.jpg"
};

describe("<Item />", () => {
  it("matches the snapshot", () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);

    expect(toJSON(wrapper)).toMatchSnapshot();
  });
  /* it("renders the image properly", () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    const img = wrapper.find("img");
    expect(img.props().src).toBe(fakeItem.image);
    expect(img.props().alt).toBe(fakeItem.title);
  });

  it("renders the title, price and description", () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    expect(wrapper.find("Title a").text()).toBe(fakeItem.title);
    expect(wrapper.find("p").text()).toBe(fakeItem.description);
    expect(
      wrapper
        .find("PriceTag")
        .children()
        .text()
    ).toBe("$100.01");
  });

  it("renders the buttons", () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    const buttons = wrapper.find(".buttonList");
    expect(buttons.children()).toHaveLength(3);
    expect(buttons.exists("Link")).toBe(true);
    expect(buttons.exists("AddToCart")).toBe(true);
    expect(buttons.exists("DeleteItem")).toBe(true);
  }); */
});
