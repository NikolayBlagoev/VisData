import express from 'express';
import path from 'path';

const app = express();
const port = 3000;
app.use(express.static("views"));
app.use('/*', (_, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

app.listen(port, () => console.log(`APPLICATION UP ON ${port}!`));