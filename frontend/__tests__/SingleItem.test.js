import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeItem } from "../lib/testUtils";
import SingleItem, { SINGLE_ITEM_QUERY } from "../components/SingleItem";

describe("<SingleItem />", () => {
  it("loads the correct data", async () => {
    const mocks = [
      {
        request: { query: SINGLE_ITEM_QUERY, variables: { id: "123" } },
        result: {
          data: {
            item: fakeItem()
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>
    );
    expect(wrapper.contains("Loading...")).toBe(true);

    await wait(0);
    wrapper.update();

    expect(toJSON(wrapper.find("img"))).toMatchSnapshot();
    expect(toJSON(wrapper.find("h2"))).toMatchSnapshot();
    expect(toJSON(wrapper.find("p"))).toMatchSnapshot();
  });

  it("displays error if item not found", async () => {
    const mocks = [
      {
        request: { query: SINGLE_ITEM_QUERY, variables: { id: "123" } },
        result: { errors: [{ message: "Items Not Found!" }] }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(
      toJSON(wrapper.find('[data-test="graphql-error"]'))
    ).toMatchSnapshot();
  });
});
