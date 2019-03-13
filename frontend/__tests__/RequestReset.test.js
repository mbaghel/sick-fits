import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import RequestReset, {
  REQUEST_RESET_MUTATION
} from "../components/RequestReset";

const mocks = [
  {
    request: {
      query: REQUEST_RESET_MUTATION,
      variables: { email: "test@test.com" }
    },
    result: {
      data: {
        requestReset: {
          message: "success",
          __typename: "message"
        }
      }
    }
  }
];

describe("<RequestReset />", () => {
  it("renders the form", () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>
    );

    const form = wrapper.find('form[data-test="form"]');
    expect(toJSON(form)).toMatchSnapshot();
  });

  it("calls the mutation", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );

    wrapper.find("input").simulate("change", {
      target: { name: "email", value: "test@test.com" }
    });
    wrapper.find("form[data-test='form']").simulate("submit");

    await wait(5);
    wrapper.update();
    expect(wrapper.find("p").text()).toBe(
      "Success! Check your email for a reset link."
    );
  });
});
