const { Router } = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const util = require("util");
const path = require("path");

const SECRET_KEY = "itissecret";

const router = new Router();

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// const users = [
//   {
//     id: 1,
//     name: "Nurulloh",
//     login: "nurulloh_rich",
//     password: "abc123",
//     phone: "+998990066011",
//     admin: true,
//   },
//   {
//     id: 2,
//     name: "Abdulloh",
//     login: "abdulloh_pro",
//     password: "abc123",
//     phone: "+998990066666",
//     admin: false,
//   },
// ];

// const doctors = [
//   "Endokrinolog",
//   "Pulmonolog",
//   "Kardiolog",
//   "Nevrolog",
//   "Nevropatolog",
//   "Okulist",
//   "Neyroxirurg",
//   "Ortoped",
//   "Stomatolog",
//   "Pediator",
// ];

// const orderTimes = [
//   {
//     time: "9:00",
//     isActive: false,
//   },
//   {
//     time: "9:15",
//     isActive: false,
//   },
//   {
//     time: "9:30",
//     isActive: false,
//   },
//   {
//     time: "9:45",
//     isActive: false,
//   },
//   {
//     time: "10:00",
//     isActive: false,
//   },
//   {
//     time: "10:15",
//     isActive: false,
//   },
//   {
//     time: "10:30",
//     isActive: false,
//   },
//   {
//     time: "10:45",
//     isActive: false,
//   },
//   {
//     time: "11:00",
//     isActive: false,
//   },
//   {
//     time: "11:15",
//     isActive: false,
//   },
//   {
//     time: "11:30",
//     isActive: false,
//   },
//   {
//     time: "11:30",
//     isActive: false,
//   },
//   {
//     time: "11:45",
//     isActive: false,
//   },
//   {
//     time: "14:00",
//     isActive: false,
//   },
//   {
//     time: "14:15",
//     isActive: false,
//   },
//   {
//     time: "14:30",
//     isActive: false,
//   },
//   {
//     time: "14:45",
//     isActive: false,
//   },
//   {
//     time: "15:00",
//     isActive: false,
//   },
//   {
//     time: "15:15",
//     isActive: false,
//   },
//   {
//     time: "15:30",
//     isActive: false,
//   },
//   {
//     time: "15:45",
//     isActive: false,
//   },
//   {
//     time: "16:00",
//     isActive: false,
//   },
//   {
//     time: "16:15",
//     isActive: false,
//   },
//   {
//     time: "16:30",
//     isActive: false,
//   },
//   {
//     time: "16:45",
//     isActive: false,
//   },
// ];

// const orders = [];

async function getUsers() {
  const users =
    JSON.parse(
      await readFile(path.resolve(__dirname, "../model/users.json"), "utf-8")
    ) || [];

  return users;
}

async function getDoctors() {
  const doctors =
    JSON.parse(
      await readFile(path.resolve(__dirname, "../model/doctors.json"), "utf-8")
    ) || [];

  return doctors;
}

async function getOrders() {
  const orders =
    JSON.parse(
      await readFile(path.resolve(__dirname, "../model/orders.json"), "utf-8")
    ) || [];
  return orders;
}

async function updateOrders(orders) {
  await writeFile(
    path.resolve(__dirname, "../model/orders.json"),
    JSON.stringify(orders, null, 4)
  );
}

async function getOrderTimes() {
  const orderTimes =
    JSON.parse(
      await readFile(
        path.resolve(__dirname, "../model/orderTimes.json"),
        "utf-8"
      )
    ) || [];

  return orderTimes;
}

async function findUser(cookie) {
  if (cookie.token) {
    let { login, password } = jwt.verify(cookie.token, SECRET_KEY);

    const users = await getUsers();

    const foundUser = users.find(
      (row) => row.login === login && row.password === password
    );
    if (foundUser) {
      return foundUser;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

async function findUserIndex(cookie) {
  if (cookie.token) {
    let { login, password } = jwt.verify(cookie.token, SECRET_KEY);

    const users = await getUsers();

    const foundUserIndex = users.findIndex(
      (row) => row.login === login && row.password === password
    );

    if (foundUserIndex >= 0) {
      return foundUserIndex;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

async function validateCookie(req, res, next) {
  const { cookies } = req;

  if (cookies.token) {
    let { login, password } = jwt.verify(cookies.token, SECRET_KEY);

    const users = await getUsers();

    const foundUser = users.find(
      (item) => item.login === login && item.password === password
    );
    if (foundUser) {
      next();
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
}

router
  .get("/", (req, res) => {
    res.render("index.ejs");
  })
  .get("/signup", (req, res) => {
    res.render("signup.ejs");
  })
  .post("/signup", async (req, res) => {
    const { name, login, password, phone } = req.body;

    const users = await getUsers();

    users.push({
      id: users[users.length - 1]?.id + 1 || 0,
      name,
      login,
      password,
      phone,
      admin: false,
    });

    await writeFile(
      path.resolve(__dirname, "../model/users.json"),
      JSON.stringify(users, null, 4)
    );

    let token = jwt.sign({ login, password }, SECRET_KEY);

    res.cookie("token", token).redirect("/profile");
  })
  .get("/users", (req, res) => {
    res.send(users);
  })
  .get("/edit", async (req, res) => {
    const user = await findUser(req.cookies);
    res.render("edit.ejs", { data: user });
  })
  .get("/edit/:id", async (req, res) => {
    const { id } = req.params;
    const user = await findUser(req.cookies);
    const orders = await getOrders();
    const orderTimes = await getOrderTimes();
    const doctors = await getDoctors();

    const filteredTimes = orderTimes.filter((item) => item.isActive === false);
    const userOrder = orders.find((item) => item.id === Number(id));
    res.render("editOrder.ejs", {
      data: user,
      doctors,
      filteredTimes,
      userOrder: userOrder,
    });
  })
  .post("/edit/:id", async (req, res) => {
    const { id } = req.params;
    const { time, doctor } = req.body;
    const orders = await getOrders();
    const orderTimes = await getOrderTimes();

    const userOrderIndex = orders.findIndex((item) => item.id === Number(id));

    const foundOrderTime = orderTimes.findIndex(
      (row) => row.time == orders[userOrderIndex].time
    );

    orderTimes[foundOrderTime].isActive = false;

    await writeFile(
      path.resolve(__dirname, "../model/orderTimes.json"),
      JSON.stringify(orderTimes, null, 4)
    );

    orders[userOrderIndex].time = time;
    orders[userOrderIndex].doctor = doctor;

    updateOrders(orders);

    const updatedOrderTime = orderTimes.findIndex((row) => row.time == time);

    orderTimes[updatedOrderTime].isActive = true;
    await writeFile(
      path.resolve(__dirname, "../model/orderTimes.json"),
      JSON.stringify(orderTimes, null, 4)
    );

    res.redirect("/profile");
  })
  .put("/edit", async (req, res) => {
    const { username, login, password } = req.body;
    const foundUserIndex = await findUserIndex(req.cookies);

    const users = await getUsers();
    const orders = await getOrders();

    orders.forEach((row) => {
      if (row.login === users[foundUserIndex].login) {
        row.login = login;
      }
    });

    updateOrders(orders);

    users[foundUserIndex].login = login;
    users[foundUserIndex].name = username;
    users[foundUserIndex].password = password;

    await writeFile(
      path.resolve(__dirname, "../model/users.json"),
      JSON.stringify(users, null, 4)
    );

    let token = jwt.sign(
      {
        login: users[foundUserIndex].login,
        password: users[foundUserIndex].password,
      },
      SECRET_KEY
    );

    res.cookie("token", token).redirect("/profile");
  })
  .get("/login", (req, res) => {
    res.render("login.ejs");
  })
  .post("/login", async (req, res) => {
    try {
      const { login, password } = req.body;
      const users = await getUsers();

      const foundUser = users.find(
        (item) => item.login === login && item.password === password
      );

      let token = jwt.sign(
        { login: foundUser.login, password: foundUser.password },
        SECRET_KEY
      );
      res.cookie("token", token).redirect("/profile");
    } catch (err) {
      console.log(err);
      res.send({ message: "Bad request" });
    }
  })
  .get("/profile", validateCookie, async (req, res) => {
    const user = await findUser(req.cookies);

    const orderTimes = await getOrderTimes();
    const orders = await getOrders();
    const doctors = await getDoctors();

    if (orders[orders.length - 1]?.date - 1 != new Date().getDate()) {
      for (let index = 0; index < orderTimes.length; index++) {
        orderTimes[index].isActive = false;
      }
    }

    const filteredTimes = orderTimes.filter((item) => item.isActive === false);
    const userOrders = orders.filter((item) => item.login === user.login);
    res.render("profile.ejs", {
      data: user,
      doctors: doctors,
      filteredTimes,
      userOrders,
    });
  })
  .post("/order", async (req, res) => {
    const { time, doctor } = req.body;
    const foundUser = await findUser(req.cookies);
    const orders = await getOrders();
    const orderTimes = await getOrderTimes();

    if (orderTimes[orderTimes.length - 1].date != new Date().getDate()) {
      for (let index = 0; index < orderTimes.length; index++) {
        orderTimes[index].isActive = false;
      }
    }

    orders.push({
      id: orders[orders.length - 1]?.id + 1 || 0,
      time: time,
      doctor: doctor,
      date: new Date().getDate() + 1,
      month: months[new Date().getMonth()],
      login: foundUser.login,
    });

    await updateOrders(orders);

    const chechedTimeIndex = orderTimes.findIndex((row) => row.time === time);
    orderTimes[chechedTimeIndex].isActive = true;
    await writeFile(
      path.resolve(__dirname, "../model/orderTimes.json"),
      JSON.stringify(orderTimes, null, 4)
    );
    res.redirect("profile");
  })
  .delete("/deleteOrder", async (req, res) => {
    const orders = await getOrders();
    const orderTimes = await getOrderTimes();
    const foundOrder = orders.findIndex((row) => row.id == req.body.id);
    const foundOrderTime = orderTimes.findIndex(
      (row) => row.time == orders[foundOrder].time
    );
    orderTimes[foundOrderTime].isActive = false;
    orders.splice(foundOrder, 1);
    await writeFile(
      path.resolve(__dirname, "../model/orderTimes.json"),
      JSON.stringify(orderTimes, null, 4)
    );
    await writeFile(
      path.resolve(__dirname, "../model/orders.json"),
      JSON.stringify(orders, null, 4)
    );

    res.status(200);
  });

module.exports = router;
