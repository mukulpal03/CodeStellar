import { RootRoute, Route, Router } from '@tanstack/react-router';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import ProblemsPage from '../pages/ProblemsPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import NotFoundPage from '../pages/NotFoundPage'; 

const rootRoute = new RootRoute({
  component: MainLayout, 
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const problemsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/problems',
  component: ProblemsPage,
});

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const signupRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  problemsRoute,
  loginRoute,
  signupRoute,
]);

export const router = new Router({ 
  routeTree,
  notFoundComponent: NotFoundPage, // Configure the not found component
});
