import CustomRouter from "#/lib/router/customRouter";
import express from "express";

const groupARouting = new CustomRouter({
  prefix: "/groupA",
}).get("/hello", {}, async () => ({
  message: "Hello from Group A",
}));

const groupCnestedRouting = new CustomRouter({
  prefix: "/groupB/groupC",
}).get("/hello", {}, async () => ({
  message: "Hello from Group C",
}));

const groupBRouting = new CustomRouter({
  prefix: "/groupB",
})
  .get("/hello", {}, async () => ({
    message: "Hello from Group B",
  }))
  .use(groupCnestedRouting.route);

const GroupingRoutingApp = express();
GroupingRoutingApp.use(groupARouting.route);
GroupingRoutingApp.use(groupBRouting.route);

export { GroupingRoutingApp };
