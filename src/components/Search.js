import React, { Component } from "react";
import { withApollo } from "react-apollo";
import gql from "graphql-tag";
import Link from "./Link";

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
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

class Search extends Component {
  // the links field in the componet state will hold all the links to be rendered,
  // so this time we're not accessing query results through component props.
  state = {
    links: [],
    filter: "",
    successfulSearch: true
  };

  render() {
    let searchResults = <h4>No links!</h4>;

    if (this.state.successfulSearch) {
      searchResults = this.state.links.map((link, index) => (
        <Link key={link.id} link={link} index={index} />
      ));
    }

    return (
      <div>
        <div>
          Search
          <input
            type="text"
            onChange={e => this.setState({ filter: e.target.value })}
          />
          <button onClick={() => this._executeSearch()}>OK</button>
        </div>
        {searchResults}
      </div>
    );
  }

  _executeSearch = async () => {
    this.setState({ successfulSearch: true });
    const { filter } = this.state;

    // maunually executing the FEED_SEARCH_QUERY and retreiving the `links` from the server response
    const result = await this.props.client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter }
    });

    // then putting the links in the component's state so they can be rendered
    const links = result.data.feed.links;
    this.setState({ links });
    console.log(links);
    if (!links.length) return this.setState({ successfulSearch: false });
  };
}

export default withApollo(Search);
