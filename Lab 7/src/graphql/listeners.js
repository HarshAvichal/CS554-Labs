import { gql } from '@apollo/client';

const LISTENER_LIST_FIELDS = gql`
  fragment ListenerListFields on Listener {
    _id
    first_name
    last_name
    subscription_tier
    numOfFavoriteAlbums
  }
`;

export const LISTENERS_QUERY = gql`
  query Listeners {
    listeners {
      ...ListenerListFields
    }
  }
  ${LISTENER_LIST_FIELDS}
`;

export const GET_LISTENERS_BY_SUBSCRIPTION = gql`
  query GetListenersBySubscription($tier: String!) {
    getListenersBySubscription(tier: $tier) {
      ...ListenerListFields
    }
  }
  ${LISTENER_LIST_FIELDS}
`;

export const SEARCH_LISTENERS_BY_LAST_NAME = gql`
  query SearchListenersByLastName($searchTerm: String!) {
    searchListenersByLastName(searchTerm: $searchTerm) {
      ...ListenerListFields
    }
  }
  ${LISTENER_LIST_FIELDS}
`;

export const ADD_LISTENER = gql`
  mutation AddListener(
    $first_name: String!
    $last_name: String!
    $email: String!
    $date_of_birth: String!
    $subscription_tier: String!
  ) {
    addListener(
      first_name: $first_name
      last_name: $last_name
      email: $email
      date_of_birth: $date_of_birth
      subscription_tier: $subscription_tier
    ) {
      _id
      first_name
      last_name
    }
  }
`;

export const EDIT_LISTENER = gql`
  mutation EditListener(
    $_id: String!
    $first_name: String
    $last_name: String
    $email: String
    $date_of_birth: String
    $subscription_tier: String
  ) {
    editListener(
      _id: $_id
      first_name: $first_name
      last_name: $last_name
      email: $email
      date_of_birth: $date_of_birth
      subscription_tier: $subscription_tier
    ) {
      _id
      first_name
      last_name
    }
  }
`;

export const REMOVE_LISTENER = gql`
  mutation RemoveListener($_id: String!) {
    removeListener(_id: $_id) {
      _id
    }
  }
`;
