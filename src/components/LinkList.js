import React, { Component } from "react";
import Link from "./Link";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { subscribe } from "graphql";

export const FEED_QUERY = gql`
  {
    feed {
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`;

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;

class LinkList extends Component {
  render() {
    return (
      <Query query={FEED_QUERY}>
        {/* render prop function */}
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return <div>Fetching</div>;
          if (error) return <div>Error</div>;

          this._subscribeToNewLinks(subscribeToMore);

          const linksToRender = data.feed.links;

          return (
            <div>
              {linksToRender.map((link, index) => (
                <Link
                  key={link.id}
                  link={link}
                  index={index}
                  updateStoreAfterVote={this._updateCacheAfterVote}
                />
              ))}
            </div>
          );
        }}
      </Query>
    );
  }

  _updateCacheAfterVote = (store, createVote, linkId) => {
    // 1. read the CURRENT state of the cached data
    // readQuery never makes a request to the GraphQL server.  It will always read
    // from the cache or throw an error if it's not in the store.
    const data = store.readQuery({ query: FEED_QUERY });

    // 2. get the link the user just voted for
    const votedLink = data.feed.links.find(link => link.id === linkId);
    // 3. reset its votes to the votes that were just returned by the server
    votedLink.votes = createVote.link.votes;

    // 4. Write the modified data back to the store (cache) so it's in sync with the server data
    // Changes with writeQuery() are not persisted to the backend.
    // Reloading will cause the changes to disappear.
    store.writeQuery({ query: FEED_QUERY, data });
  };

  _subscribeToNewLinks = subscribeToMore => {
    subscribeToMore({
      // the subscription query itself.  will fire everytime a new link is created
      document: NEW_LINKS_SUBSCRIPTION,

      // (similar to 'update' prop) lets you determine how the store should be updated with the info
      // sent by the server AFTER the event occured.
      // follows same principle as Redux reducer; takes two args:
      // previous state and the subscription data sent by the server
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        // get the newLink from subscriptionData
        const newLink = subscriptionData.data.newLink;

        // guard if it already exists
        const exists = prev.feed.links.find(({ id }) => id === newLink.id);
        if (exists) return prev;

        // merge the newLink into the existing links and return
        return Object.assign({}, prev, {
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename
          }
        });
      }
    });
  };

  _subscribeToNewVotes = subscribeToMore => {
    subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION
    });
  };
}

export default LinkList;
