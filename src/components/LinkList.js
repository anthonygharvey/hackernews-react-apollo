import React, { Component } from "react";
import Link from "./Link";
import gql from "graphql-tag";
import { Query } from "react-apollo";

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

class LinkList extends Component {
  render() {
    return (
      <Query query={FEED_QUERY}>
        {/* render prop function */}
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>;
          if (error) return <div>Error</div>;

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
}

export default LinkList;
