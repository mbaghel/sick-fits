import { shallow } from "enzyme";
import toJSON from "enzyme-to-json";
import CartCountComponent from "../components/CartCount";

describe("<CartCount />", () => {
  it("renders without errors", () => {
    shallow(<CartCountComponent count={10} />);
  });

  it("matches the snapshot", () => {
    const wrapper = shallow(<CartCountComponent count={6} />);
    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  it("handles updates to its props", () => {
    const wrapper = shallow(<CartCountComponent count={25} />);
    expect(toJSON(wrapper)).toMatchSnapshot();

    wrapper.setProps({ count: 19 });
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
});
