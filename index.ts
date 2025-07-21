import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import fetch from "node-fetch";

const port = 5000;
const hostname = "0.0.0.0";

const server = http.createServer((req, res) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.url === "/" || req.url === "/app/" || req.url === "/app/index.html") {
    // Serve the 3D Scene Builder app
    const htmlPath = path.join(process.cwd(), "public", "app", "index.html");

    fs.readFile(htmlPath, "utf8", (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("File not found");
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.end(data);
    });
  } else if (
    req.url === "/app/babylon-stage.js" ||
    req.url === "/babylon-stage.js"
  ) {
    // Serve the babylon-stage.js file
    const appPath = path.join(
      process.cwd(),
      "public",
      "app",
      "babylon-stage.js",
    );

    fs.readFile(appPath, "utf8", (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("babylon-stage.js file not found");
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/javascript");
      res.end(data);
    });
  } else if (req.url === "/app/shot.js" || req.url === "/shot.js") {
    // Serve the shot.js file
    const appPath = path.join(process.cwd(), "public", "app", "shot.js");

    fs.readFile(appPath, "utf8", (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("shot.js file not found");
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/javascript");
      res.end(data);
    });
  } else if (req.url === "/app/ai.js" || req.url === "/ai.js") {
    // Serve the ai.js file
    const appPath = path.join(process.cwd(), "public", "app", "ai.js");

    fs.readFile(appPath, "utf8", (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("ai.js file not found");
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/javascript");
      res.end(data);
    });
  } else if (req.url === "/styles.css") {
    // Serve the CSS file
    const cssPath = path.join(process.cwd(), "public", "styles.css");

    fs.readFile(cssPath, "utf8", (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("CSS file not found");
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "text/css");
      res.end(data);
    });
  } else if (req.url?.startsWith("/scenes/")) {
    // Serve scene images from the scenes directory
    const filename = req.url.split("/scenes/")[1];
    const filePath = path.join(process.cwd(), "public", "scenes", filename);

    console.log(`Attempting to serve scene image: ${filePath}`);

    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error(`Scene image not found: ${filePath}`, err);
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end(`Scene image not found: ${filename}`);
        return;
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(`Error reading scene image: ${filePath}`, err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain");
          res.end("Error reading scene image");
          return;
        }

        const ext = path.extname(filename).toLowerCase();
        let contentType = "image/jpeg";
        if (ext === ".png") contentType = "image/png";
        if (ext === ".gif") contentType = "image/gif";
        if (ext === ".webp") contentType = "image/webp";

        res.statusCode = 200;
        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Length", stats.size.toString());
        res.end(data);

        console.log(
          `Successfully served scene image: ${filename} (${stats.size} bytes)`,
        );
      });
    });
  } else if (req.url?.startsWith("/assets/")) {
    // Serve assets (GLB files and images) from the public/assets directory
    const filename = req.url.split("/assets/")[1];
    const filePath = path.join(process.cwd(), "public", "assets", filename);

    console.log(`Attempting to serve asset: ${filePath}`);

    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error(`Asset not found: ${filePath}`, err);
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end(`Asset not found: ${filename}`);
        return;
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(`Error reading asset: ${filePath}`, err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain");
          res.end("Error reading asset");
          return;
        }

        const ext = path.extname(filename).toLowerCase();
        let contentType = "application/octet-stream"; // Default for binary files

        // Set content type based on file extension
        if (ext === ".glb" || ext === ".gltf") {
          contentType = "model/gltf-binary";
        } else if (ext === ".png") {
          contentType = "image/png";
        } else if (ext === ".jpg" || ext === ".jpeg") {
          contentType = "image/jpeg";
        } else if (ext === ".gif") {
          contentType = "image/gif";
        } else if (ext === ".webp") {
          contentType = "image/webp";
        } else if (ext === ".svg") {
          contentType = "image/svg+xml";
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Length", stats.size.toString());
        res.end(data);

        console.log(
          `Successfully served asset: ${filename} (${stats.size} bytes)`,
        );
      });
    });
  } else if (req.url?.startsWith("/img/")) {
    // Serve images from the public/img directory
    const filename = req.url.split("/img/")[1];
    const filePath = path.join(process.cwd(), "public", "img", filename);

    console.log(`Attempting to serve image: ${filePath}`);

    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error(`Image not found: ${filePath}`, err);
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end(`Image not found: ${filename}`);
        return;
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(`Error reading image: ${filePath}`, err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain");
          res.end("Error reading image");
          return;
        }

        const ext = path.extname(filename).toLowerCase();
        let contentType = "image/jpeg";
        if (ext === ".png") contentType = "image/png";
        if (ext === ".gif") contentType = "image/gif";
        if (ext === ".webp") contentType = "image/webp";
        if (ext === ".svg") contentType = "image/svg+xml";

        res.statusCode = 200;
        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Length", stats.size.toString());
        res.end(data);

        console.log(
          `Successfully served image: ${filename} (${stats.size} bytes)`,
        );
      });
    });
  } else if (req.url?.startsWith("/examples/")) {
    // Serve example images from the public/examples directory
    const filename = req.url.split("/examples/")[1];
    const filePath = path.join(process.cwd(), "public", "examples", filename);

    console.log(`Attempting to serve example: ${filePath}`);

    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error(`Example not found: ${filePath}`, err);
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end(`Example not found: ${filename}`);
        return;
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(`Error reading example: ${filePath}`, err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain");
          res.end("Error reading example");
          return;
        }

        const ext = path.extname(filename).toLowerCase();
        let contentType = "image/jpeg";
        if (ext === ".png") contentType = "image/png";
        if (ext === ".gif") contentType = "image/gif";
        if (ext === ".webp") contentType = "image/webp";
        if (ext === ".svg") contentType = "image/svg+xml";

        res.statusCode = 200;
        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Length", stats.size.toString());
        res.end(data);

        console.log(
          `Successfully served example: ${filename} (${stats.size} bytes)`,
        );
      });
    });
  } else if (req.url === "/api/replicate-token") {
    // Serve Replicate API token for frontend
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Replicate API token not configured" }));
      return;
    }

    res.end(JSON.stringify({ token: token }));
  } else if (req.url === "/api/generate-image" && req.method === "POST") {
    // Proxy endpoint for Replicate API
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const requestData = JSON.parse(body);

        // Debug: Log what we're sending to Replicate
        console.log("=== SERVER: Sending to Replicate API ===");
        console.log("Input keys:", Object.keys(requestData.input || {}));
        if (requestData.input) {
          console.log(
            "input_image_1 length:",
            requestData.input.input_image_1
              ? requestData.input.input_image_1.length
              : 0,
          );
          console.log(
            "input_image_2 length:",
            requestData.input.input_image_2
              ? requestData.input.input_image_2.length
              : 0,
          );
          console.log(
            "input_image_2 starts with:",
            requestData.input.input_image_2
              ? requestData.input.input_image_2.substring(0, 50)
              : "null",
          );
          console.log(
            "Prompt:",
            requestData.input.prompt
              ? requestData.input.prompt.substring(0, 100) + "..."
              : "none",
          );
          console.log("Aspect ratio:", requestData.input.aspect_ratio);
        }

        const token = process.env.REPLICATE_API_TOKEN;
        if (!token) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({ error: "Replicate API token not configured" }),
          );
          return;
        }

        // Make request to Replicate API
        const fetch = (await import("node-fetch")).default;
        const response = await fetch(
          "https://api.replicate.com/v1/models/flux-kontext-apps/multi-image-kontext-max/predictions",
          {
            method: "POST",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          },
        );

        const responseText = await response.text();

        // Debug: Log Replicate API response
        console.log("=== SERVER: Replicate API Response ===");
        console.log("Status:", response.status);
        console.log("Response length:", responseText.length);
        console.log("Response preview:", responseText.substring(0, 200));

        // Try to parse as JSON, but handle HTML error responses
        let data;
        try {
          data = JSON.parse(responseText);
          console.log("Successfully parsed JSON response");
          if (data.id) {
            console.log("Prediction ID:", data.id);
          }
          if (data.error) {
            console.log("API returned error:", data.error);
          }
        } catch (parseError) {
          console.error(
            "Failed to parse Replicate API response as JSON:",
            responseText.substring(0, 500),
          );

          // Check for specific error types
          if (responseText.includes("502 Bad Gateway")) {
            data = {
              error:
                "Replicate API is temporarily unavailable (502 Bad Gateway). Please try again in a few minutes.",
            };
          } else if (responseText.includes("503 Service Unavailable")) {
            data = {
              error:
                "Replicate API is temporarily down for maintenance. Please try again later.",
            };
          } else if (responseText.includes("504 Gateway Timeout")) {
            data = {
              error: "Replicate API request timed out. Please try again.",
            };
          } else {
            data = {
              error:
                "Replicate API returned an invalid response. Please try again.",
            };
          }
        }

        res.statusCode = response.status;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(JSON.stringify(data));
      } catch (error) {
        console.error("Error in generate-image proxy:", error);
        console.error("Error details:", error.message);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({ error: "Internal server error: " + error.message }),
        );
      }
    });
  } else if (
    req.url?.startsWith("/api/replicate-status/") &&
    req.method === "GET"
  ) {
    // Proxy endpoint for Replicate status polling
    const statusUrl = decodeURIComponent(
      req.url.split("/api/replicate-status/")[1],
    );

    (async () => {
      try {
        const token = process.env.REPLICATE_API_TOKEN;
        if (!token) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({ error: "Replicate API token not configured" }),
          );
          return;
        }

        const fetch = (await import("node-fetch")).default;
        const response = await fetch(statusUrl, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        const responseText = await response.text();

        // Try to parse as JSON, but handle HTML error responses
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "Failed to parse Replicate status response as JSON:",
            responseText.substring(0, 500),
          );

          // Check for specific error types
          if (responseText.includes("502 Bad Gateway")) {
            data = {
              error:
                "Replicate API is temporarily unavailable (502 Bad Gateway). Please try again in a few minutes.",
            };
          } else if (responseText.includes("503 Service Unavailable")) {
            data = {
              error:
                "Replicate API is temporarily down for maintenance. Please try again later.",
            };
          } else if (responseText.includes("504 Gateway Timeout")) {
            data = {
              error: "Replicate API request timed out. Please try again.",
            };
          } else {
            data = {
              error:
                "Replicate API returned an invalid response. Please try again.",
            };
          }
        }

        res.statusCode = response.status;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(JSON.stringify(data));
      } catch (error) {
        console.error("Error in replicate-status proxy:", error);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    })();
  } else if (req.url === "/api/refine-image" && req.method === "POST") {
    // Proxy endpoint for Black Forest Labs flux-kontext-max API
    let requestBody = "";
    req.on("data", (chunk) => {
      requestBody += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const requestData = JSON.parse(requestBody);
        const token = process.env.REPLICATE_API_TOKEN;

        if (!token) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({ error: "Replicate API token not configured" }),
          );
          return;
        }

        const fetch = (await import("node-fetch")).default;
        const response = await fetch(
          "https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-max/predictions",
          {
            method: "POST",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          },
        );

        const responseText = await response.text();

        // Try to parse as JSON, but handle HTML error responses
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "Failed to parse Replicate refine response as JSON:",
            responseText.substring(0, 500),
          );

          // Check for specific error types
          if (responseText.includes("502 Bad Gateway")) {
            data = {
              error:
                "Replicate API is temporarily unavailable (502 Bad Gateway). Please try again in a few minutes.",
            };
          } else if (responseText.includes("503 Service Unavailable")) {
            data = {
              error:
                "Replicate API is temporarily down for maintenance. Please try again later.",
            };
          } else if (responseText.includes("504 Gateway Timeout")) {
            data = {
              error: "Replicate API request timed out. Please try again.",
            };
          } else {
            data = {
              error:
                "Replicate API returned an invalid response. Please try again.",
            };
          }
        }

        res.statusCode = response.status;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(JSON.stringify(data));
      } catch (error) {
        console.error("Error in refine-image proxy:", error);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
  } else if (req.url === "/readme.md" || req.url === "/README.md") {
    // Serve raw README.md file
    const readmePath = path.join(process.cwd(), "README.md");

    fs.readFile(readmePath, "utf8", (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("README.md not found");
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.end(data);
    });
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Not found");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
