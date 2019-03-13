import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import Router from "next/router";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeItem } from "../lib/testUtils";
import CreateItem, { CREATE_ITEM_MUTATION } from "../components/CreateItem";

const dogImage = "https://dog.com/dog.jpg";

// mock global fetch in test env
global.fetch = jest.fn().mockResolvedValue({
  json: () => ({
    secure_url: dogImage,
    eager: [{ secure_url: dogImage }]
  })
});

describe("<CreateItem />", () => {
  it("renders to the dom", () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    const form = wrapper.find('form[data-test="form"]');
    expect(toJSON(form)).toMatchSnapshot();
  });

  it("uploads an image", async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    const input = wrapper.find("#file");
    input.simulate("change", { target: { files: ["fake_image"] } });
    await wait();
    wrapper.update();
    const component = wrapper.find("CreateItem").instance();
    expect(component.state.image).toBe(dogImage);
    expect(component.state.largeImage).toBe(dogImage);
    expect(global.fetch).toHaveBeenCalled();
    global.fetch.mockReset();
  });

  it("handles state updates", async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    wrapper
      .find("#title")
      .simulate("change", { target: { name: "title", value: "Test Item" } });
    wrapper.find("#description").simulate("change", {
      target: { name: "description", value: "What a cool item!" }
    });
    wrapper.find("#price").simulate("change", {
      target: { name: "price", value: 500, type: "number" }
    });
    await wait();

    expect(wrapper.find("CreateItem").instance().state).toMatchObject({
      title: "Test Item",
      description: "What a cool item!",
      image: "",
      largeImage: "",
      price: 500
    });
  });

  it("creates an item when the form is submitted", async () => {
    const item = fakeItem();
    const mocks = [
      {
        request: {
          query: CREATE_ITEM_MUTATION,
          variables: {
            title: item.title,
            description: item.description,
            price: item.price,
            image: "",
            largeImage: ""
          }
        },
        result: {
          data: {
            createItem: {
              ...item,
              __typename: "Item"
            }
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CreateItem />
      </MockedProvider>
    );

    wrapper
      .find("#title")
      .simulate("change", { target: { name: "title", value: item.title } });
    wrapper.find("#description").simulate("change", {
      target: { name: "description", value: item.description }
    });
    wrapper.find("#price").simulate("change", {
      target: { name: "price", value: item.price, type: "number" }
    });
    // Mock the router
    Router.router = { push: jest.fn() };

    wrapper.find("form").simulate("submit");
    await wait(50);
    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: "/item",
      query: { id: "abc123" }
    });
  });
});
