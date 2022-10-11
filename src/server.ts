import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/filteredimage", async (request: Request, response: Response) => {

    const { image_url }: { image_url: string } = request.query;

    if (!image_url) {
      response.status(400).send({ message: "image url is required as a query parameter, please check again." });
      return;
    }

    if (!image_url.startsWith('https')) {
      response.status(400).send({ message: "Kindly note, image seems to be from an insecure connection!!!" });
      return;
    }

    filterImageFromURL(image_url)
      .then(image => {
        response.sendFile(image, () => {
          const imagesToBeDeleted: Array<string> = new Array(image);
          deleteLocalFiles(imagesToBeDeleted);
        });
      }).catch(error => {
        response.status(500).send({ message: "Error: Image loading failed." });
        return;
      })
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();