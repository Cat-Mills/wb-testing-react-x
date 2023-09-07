import { rest } from "msw";
import { setupServer } from "msw/node";
import App from "../App.jsx";
import { render, screen, fireEvent } from "@testing-library/react";
import Root from "../pages/Root.jsx";
import userEvent from "@testing-library/user-event";


const server = setupServer(
  rest.get("/api/movies", (req, res, ctx) => {
    return res(ctx.json([{ movieId: 1, title: "Test Movie" }]));
  }),
  rest.get('/api/ratings', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          ratingId: 1,
          score: 2,
          movieId: 1,
          movie: {
            title: 'Test Movie',
          },
        },
      ]),
    );
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
const user = userEvent.setup();

test("renders homepage at /", async () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /movie ratings app/i })
  ).toBeInTheDocument();
});

describe("page navigation", () => {

  test("can navigate to all movies page", async () => {
    render(<App />);

    await user.click(screen.getByRole("link", { name: /all movies/i }));

    expect(
      screen.getByRole("heading", { name: /all movies/i })
    ).toBeInTheDocument();

  });

  test("can navigate to the login page", async () => { 
    render(<App/>);

    await user.click(screen.getByRole("link", { name: /log in/i }));

    expect(
      screen.getByRole("heading", { name: /log in/i })
    ).toBeInTheDocument();
  });

  test("can navigate to the user ratings page", async () => { 
    server.use(
      rest.get('/api/ratings', (req, res, ctx) => {
        return res(
          ctx.json([
            {
              ratingId: 1,
              score: 2,
              movieId: 1,
              movie: {
                title: 'Test Movie',
              },
            },
          ]),
        );
      }),
    )
    render(<App/>)

    await user.click(screen.getByRole("link", { name: /your ratings/i }))

    expect(
      screen.getByRole("heading", { name: /your ratings/i })
    ).toBeInTheDocument()
  });

  test("can navigate to a movie detail page", async () => { 
    server.use(
      rest.get('/api/movies/:movieId', (req, res, ctx) => {
        return res(
          ctx.json({
            movieId: 1,
            title: 'Test Movie',
            posterPath: 'poster.jpg',
            overview: 'Test overview',
          }),
        );
      }),
    )
    render(<App/>)
    
    await user.click(screen.getByRole('link', {name: /all movies/i }))
    await user.click(screen.getByRole('link', {name: /test movie/i }))

    expect(screen.getByRole('heading', { name: /test movie/i })).toBeInTheDocument()
  });
});

test("logging in redirects to user ratings page", async () => { 
  server.use(
    rest.post('/api/auth', (req,res,ctx) => {
      console.log("hit")
      return res(ctx.json({ success: true }))
    })
  )

  render(<App/>)

  await user.click(screen.getByRole('link', { name: /log in/i }))

  await user.type(screen.getByLabelText(/email/i), 'user1@test.com')
  await user.type(screen.getByLabelText(/password/i), 'test')
  // console.log(screen.getByLabelText(/email/i))
  await user.click(screen.getByRole('button', { name: /log in/i }))

  expect(screen.getByRole('heading', { name: /your ratings/i })).toBeInTheDocument()
});

test("creating a rating redirects to user ratings page", async () => { 
    // Route for creating a rating
    server.use(
      rest.post('/api/ratings', (req, res, ctx) => {
        return res(ctx.json({ ratingId: 1, score: 2 }));
      }),
    );
  
    render(<App />);
    
  
    // Navigate to movie detail page
    await user.click(screen.getByRole('link', { name: /all movies/i }));
    await user.click(screen.getByRole('link', { name: /test movie/i }));
    // Create a rating
    fireEvent.change(screen.getByRole('combobox', { name: /score/i }), { target: { value: '1' } });
    await user.click(screen.getByRole('button', { name: /submit/i }));
    // Redirects to user ratings page
    expect(screen.getByRole('heading', { name: /your ratings/i })).toBeInTheDocument();
});
