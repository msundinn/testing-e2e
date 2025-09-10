describe("movies app", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should show input, button and container", () => {
    cy.get("#searchForm").should("exist");
    cy.get("#searchText")
      .should("exist")
      .and("have.attr", "placeholder", "Skriv titel här");
    cy.get("#search").should("exist").and("contain.text", "Sök");
    cy.get("#movie-container").should("exist");
  });

  it("should show empty list before searching", () => {
    cy.get("div#movie-container").children().should("have.length", 0);
  });

  it("should show movies when searching", () => {
    const search = "Batman";

    cy.get("input#searchText").type(search);
    cy.get("button#search").click();

    cy.get("#movie-container .movie").should("have.length.greaterThan", 0);
    cy.get("#movie-container .movie h3").first().should("contain.text", search);
  });

  it("should render a movie with div, h3 and img", () => {
    cy.intercept("GET", "http://omdbapi.com/**", {
      statusCode: 200,
      body: { Search: [{ Title: "Lorem", Poster: "a.jpg" }] },
    });

    cy.get("#searchText").type("whatever");
    cy.get("#search").click();

    cy.get("#movie-container").find("div.movie").should("have.length", 1);
    cy.get("#movie-container").find("div.movie h3").should("have.length", 1);
    cy.get("#movie-container").find("div.movie img").should("have.length", 1);
  });

  it("should show mocked movies from API", () => {
    cy.intercept("GET", "http://omdbapi.com/**", {
      statusCode: 200,
      body: {
        Search: [
          { Title: "Lorem", Poster: "a.jpg" },
          { Title: "Ipsum", Poster: "b.jpg" },
        ],
      },
    });

    cy.get("input#searchText").type("whatever");
    cy.get("button#search").click();

    cy.get("#movie-container .movie").should("have.length", 2);
    cy.get("#movie-container .movie h3").first().should("have.text", "Lorem");
    cy.get("#movie-container .movie h3").last().should("have.text", "Ipsum");
  });

  it("shows 'no result' message when no movies are found", () => {
    cy.intercept("GET", "http://omdbapi.com/**", {
      statusCode: 200,
      body: { Search: [] },
    });

    cy.get("#searchText").type("whatever");
    cy.get("#search").click();

    cy.get("#movie-container .movie").should("have.length", 0);
    cy.get("#movie-container").should(
      "contain.text",
      "Inga sökresultat att visa"
    );
  });

  it("should replace previous results on new search", () => {
    cy.intercept("GET", "http://omdbapi.com/**", {
      statusCode: 200,
      body: { Search: [{ Title: "One", Poster: "1.jpg" }] },
    });

    cy.get("#searchText").type("first");
    cy.get("#search").click();
    cy.get("#movie-container .movie").should("have.length", 1);
    cy.get("#movie-container .movie h3").first().should("have.text", "One");

    cy.intercept("GET", "http://omdbapi.com/**", {
      statusCode: 200,
      body: { Search: [{ Title: "Two", Poster: "2.jpg" }] },
    });

    cy.get("#searchText").type("two");
    cy.get("#search").click();

    cy.get("#movie-container .movie").should("have.length", 1);
    cy.get("#movie-container .movie h3").first().should("have.text", "Two");
  });

  it("should empty input between renders", () => {
    cy.intercept("GET", "http://omdbapi.com/**", {
      statusCode: 200,
      body: { Search: [{ Title: "lorem", Poster: "1.jpg" }] },
    });

    cy.get("#searchText").type("lorem");
    cy.get("#search").click();

    cy.get("#searchText").should("have.value", "");
  });

  it("should search when pressing Enter", () => {
    cy.intercept("GET", "http://omdbapi.com/**", {
      statusCode: 200,
      body: { Search: [{ Title: "ipsum", Poster: "1.jpg" }] },
    });

    cy.get("#searchText").type("anything{enter}");
    cy.get("#movie-container .movie").should("have.length", 1);
    cy.get("#movie-container .movie h3").first().should("have.text", "ipsum");
  });

  it("should sort based on asc or desc and show correct order in DOM", () => {
    cy.intercept("GET", "http://omdbapi.com/**", {
      statusCode: 200,
      body: {
        Search: [
          { Title: "c-movie", Poster: "c.jpg" },
          { Title: "a-movie", Poster: "a.jpg" },
          { Title: "b-movie", Poster: "b.jpg" },
        ],
      },
    });

    cy.get("#searchText").type("lorem");
    cy.get("#search").click();

    cy.get("#sortSelect").select("desc");
    cy.get("#sortSelect").should("have.value", "desc");

    cy.get("#movie-container .movie h3").eq(0).should("have.text", "c-movie");
    cy.get("#movie-container .movie h3").eq(1).should("have.text", "b-movie");
    cy.get("#movie-container .movie h3").eq(2).should("have.text", "a-movie");

    cy.get("#sortSelect").select("asc");
    cy.get("#sortSelect").should("have.value", "asc");

    cy.get("#movie-container .movie h3").eq(0).should("have.text", "a-movie");
    cy.get("#movie-container .movie h3").eq(1).should("have.text", "b-movie");
    cy.get("#movie-container .movie h3").eq(2).should("have.text", "c-movie");
  });
});
