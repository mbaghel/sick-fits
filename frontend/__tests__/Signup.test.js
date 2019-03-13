import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { ApolloConsumer } from "react-apollo";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser } from "../lib/testUtils";
import Signup, { SIGNUP_MUTATION } from "../components/Signup";
import { CURRENT_USER_QUERY } from "../components/User";

function type(wrapper, name, value) {
  wrapper
    .find(`input[name="${name}"]`)
    .simulate("change", { target: { name, value } });
}

const me = fakeUser();

const mocks = [
  {
    request: {
      query: SIGNUP_MUTATION,
      variables: { email: me.email, name: me.name, password: "test" }
    },
    result: {
      data: {
        signup: {
          id: me.id,
          email: me.email,
          name: me.name,
          __typename: "User"
        }
      }
    }
  },
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me } }
  }
];

describe("<Signup />", () => {
  it("renders properly", () => {
    const wrapper = mount(
      <MockedProvider>
        <Signup />
      </MockedProvider>
    );
    expect(toJSON(wrapper.find("form"))).toMatchSnapshot();
  });

  it("calls the mutation properly", async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <Signup />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );
    // enter form data
    type(wrapper, "email", me.email);
    type(wrapper, "name", me.name);
    type(wrapper, "password", "test");
    await wait();
    // submit form
    wrapper.find("form").simulate("submit");
    await wait();
    // get current user from apollo client
    const user = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(user.data.me).toMatchObject(me);
  });
});
