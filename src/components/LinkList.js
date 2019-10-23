import React, { Component } from "react";
import Link from "./Link";
import gql from "graphql-tag";
import { Query } from "react-apollo";

class LinkList extends Component {
  render() {
    const FEED_QUERY = gql`
      {
        feed {
          links {
            id
            createdAt
            url
            description
          }
        }
      }
    `;

    return (
      <Query query={FEED_QUERY}>
        {/* render prop function */}
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>;
          if (error) return <div>Error</div>;

          const linksToRender = data.feed.links;

          return (
            <div>
              {linksToRender.map(link => (
                <Link key={link.id} link={link} />
              ))}
            </div>
          );
        }}
      </Query>

      // <Query query={FEED_QUERY}>
      //   {() => linksToRender.map(link => <Link key={link.id} link={link} />)}
      // </Query>
    );
  }
}

export default LinkList;
