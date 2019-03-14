import React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import styled from "styled-components";
import PropTypes from "prop-types";
import { CURRENT_USER_QUERY } from "./User";

const REMOVE_FROM_CART_MUTATION = gql`
  mutation removeFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: none;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`;

class RemoveFromCart extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  };

  // this runs when we get a response from the remove mutation
  update = (cache, payload) => {
    // get the data from the cache
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });
    // update the data
    data.me.cart = data.me.cart.filter(
      cartItem => cartItem.id !== payload.data.removeFromCart.id
    );
    // write updated data to cache
    cache.writeQuery({ query: CURRENT_USER_QUERY, data });
  };

  render() {
    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
        optimisticResponse={{
          __typename: "Mutation",
          removeFromCart: {
            __typename: "ID",
            id: this.props.id
          }
        }}
      >
        {(removeFromCart, { loading, error }) => (
          <BigButton
            disabled={loading}
            onClick={() => {
              removeFromCart().catch(err => {
                alert(err.message);
              });
            }}
            title="Delete Item"
          >
            &times;
          </BigButton>
        )}
      </Mutation>
    );
  }
}

export default RemoveFromCart;
export { REMOVE_FROM_CART_MUTATION };
