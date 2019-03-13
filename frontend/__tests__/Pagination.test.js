import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import Router from "next/router";
import { MockedProvider } from "react-apollo/test-utils";
import Pagination from "../components/Pagination";
import { PAGINATION_QUERY } from "../components/Pagination";

Router.router = {
  push() {},
  prefetch() {}
};

function mockItems(amount) {
  return [
    {
      request: { query: PAGINATION_QUERY },
      result: {
        data: {
          itemsConnection: {
            __typename: "aggregate",
            aggregate: {
              __typename: "count",
              count: amount
            }
          }
        }
      }
    }
  ];
}

describe("<Pagination />", () => {
  it("shows a loading status", () => {
    const wrapper = mount(
      <MockedProvider mocks={mockItems(1)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    expect(wrapper.find("p").text()).toBe("Loading...");
  });

  it("renders pagination for 18 items", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mockItems(18)}>
        <Pagination page={1} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    const pagination = wrapper.find('div[data-test="pagination"]');
    expect(toJSON(pagination)).toMatchSnapshot();
  });

  it("disables prev on first page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mockItems(18)}>
        <Pagination page={1} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    expect(wrapper.find(".prev").prop("aria-disabled")).toBe(true);
    expect(wrapper.find(".next").prop("aria-disabled")).toBe(false);
  });

  it("disables next on last page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mockItems(18)}>
        <Pagination page={5} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    expect(wrapper.find(".prev").prop("aria-disabled")).toBe(false);
    expect(wrapper.find(".next").prop("aria-disabled")).toBe(true);
  });

  it("enables both on middle page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mockItems(18)}>
        <Pagination page={3} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    expect(wrapper.find(".prev").prop("aria-disabled")).toBe(false);
    expect(wrapper.find(".next").prop("aria-disabled")).toBe(false);
  });
});
