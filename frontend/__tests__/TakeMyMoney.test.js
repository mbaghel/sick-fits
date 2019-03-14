import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import NProgress from "nprogress";
import Router from "next/router";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser, fakeCartItem } from "../lib/testUtils";
import TakeMyMoney, { CREATE_ORDER_MUTATION } from "../components/TakeMyMoney";
import { CURRENT_USER_QUERY } from "../components/User";

Router.router = { push() {} };

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: { ...fakeUser(), cart: [fakeCartItem()] } } }
  }
];

describe("<TakeMyMoney />", () => {
  it("renders the button correctly", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(toJSON(wrapper.find("ReactStripeCheckout"))).toMatchSnapshot();
  });

  it("creates an order", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const component = wrapper.find("TakeMyMoney").instance();
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: "xyz123"
        }
      }
    });
    component.handleToken({ id: "xyz123" }, createOrderMock);
    expect(createOrderMock).toHaveBeenCalledWith({
      variables: { token: "xyz123" }
    });
  });

  it("starts NProgress", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const component = wrapper.find("TakeMyMoney").instance();
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: "xyz123"
        }
      }
    });
    NProgress.start = jest.fn();
    component.handleToken({ id: "xyz123" }, createOrderMock);
    expect(NProgress.start).toHaveBeenCalled();
  });

  it("redirects to the order page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const component = wrapper.find("TakeMyMoney").instance();
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: "xyz123"
        }
      }
    });
    Router.router.push = jest.fn();
    component.handleToken({ id: "xyz123" }, createOrderMock);
    await wait();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: "/order",
      query: { id: "xyz123" }
    });
  });
});
