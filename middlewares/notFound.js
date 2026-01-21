const notFound = (req, res, next) => {
  res.status(404);

  // respond with json
  if (req.accepts("json")) {
    res.json({ error: "Not found" });
    return;
  }

  // respond with html page
  if (req.accepts("html")) {
    res.render("404", { url: req.url });
    return;
  }

  // default to plain-text. send()
  res.type("txt").send("Not found");
};

module.exports = notFound;
