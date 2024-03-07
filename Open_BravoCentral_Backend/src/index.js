import 'dotenv/config'
import restify from 'restify'
import mongoose from 'mongoose'
import { MongoClient, ServerApiVersion } from 'mongodb';
import whoQuestion from './classes/whoQuestion.js';
import commit from './classes/commit.js';
import Stats from './classes/stats.js';
import axios from 'axios';

const DB_URI = process.env.MONGODB_URI;
const PROJECT1_NAME = process.env.PROJECT1_NAME;
const PROJECT1_ID = process.env.PROJECT1_ID;
const GITLAB_ACESSTOKEN = process.env.GITLAB_ACESSTOKEN;
const SERVER_NAME = process.env.SERVER_NAME;
const DATABASE_NAME = process.env.DATABASE_NAME;

//Se é necessário colocar mais de um projeto, adiciona variáveis no .env e adicione nesse objeto
const PROJIDS =
    [
        {
            "projectname": PROJECT1_NAME,
            "projectid": PROJECT1_ID
        },
    ]

let port = process.env.PORT;
if (port == null || port == "") {
    port = 8080;
}

///GITLAB config
const gitlabApi = axios.create({
    baseURL: "https://gitlab.com/api",
    timeout: 80000,
})
var defaultRequestToGitlab = {
    params:
    {

    },
    headers: {
        "PRIVATE-TOKEN": GITLAB_ACESSTOKEN,
        "Content-Type": 'application/json'
    }
};
////

const connect = () => {
    mongoose.connect(DB_URI, { useUnifiedTopology: false });
    const connection = mongoose.connection;
    connection.on('error', () => console.error("Error connecting to mongodb"))
    connection.once('open', () => console.log("Connect to mongo!"))
}

const server = restify.createServer({
    name: SERVER_NAME,
})

server.use(restify.plugins.queryParser());
server.use(restify.plugins.jsonBodyParser({ requestBodyOnGet: false }));
server.use(restify.plugins.multipartBodyParser(
    {
        maxBodySize: 6000000,
        mapParams: true,
        mapFiles: true,
        keepExtensions: false,
    }
));

async function GetCommitsFromGitLab(since, until, page, completeListOfCommits, project) {
    if (completeListOfCommits == null) {
        console.log("Started list");
        completeListOfCommits = [];
    }
    var getCommitsRequest = defaultRequestToGitlab;
    getCommitsRequest.params["with_stats"] = true;
    getCommitsRequest.params["since"] = since;
    getCommitsRequest.params["until"] = until;
    getCommitsRequest.params["all"] = true;
    getCommitsRequest.params["per_page"] = 100;
    getCommitsRequest.params["page"] = page;
    //
    try {
        return gitlabApi.get(`/v4/projects/${project["projectid"]}/repository/commits`, getCommitsRequest).then(async function (response) {
            console.log(`Received list length: ${response.data.length}`);
            completeListOfCommits = completeListOfCommits.concat(response.data); // This is needed to sent the information to the next function        
            console.log(`Current list length: ${completeListOfCommits.length}`);
            var nextPage = response.headers["x-next-page"];
            if (nextPage != null && nextPage != "") {
                console.log(`Going to next page ${nextPage}`);
                return await GetCommitsFromGitLab(since, until, nextPage, completeListOfCommits, project);
            }
            else if (nextPage != null || nextPage == "") {
                console.log(`Success getting ${completeListOfCommits.length} commits from gitlab`);
                return completeListOfCommits;
            }
        });
    } catch (erro) {
        throw erro
    }
}

function GetProject(projectname) {
    for (let index = 0; index < PROJIDS.length; index++) {
        const element = PROJIDS[index];
        if (element.projectname == projectname)
            return element
    }
    return null;
}

/** Function that count occurrences of a substring in a string;
 * @param {String} string               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 *
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
 * @see https://stackoverflow.com/a/7924240/938822
 */
function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}
////////////////

//First this method is beign called
server.pre((req, res, next) => {
    console.info(`${req.method} - ${req.url}\n`)
    return next();
})

server.post("/mentalhealth/who5",
    async function (req, res, next) {
        var unparsedReq = req.body;
        // var WhoQuest = new whoQuestion()
        const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        try {
            await client.connect();

            const who5 = client.db(DATABASE_NAME).collection("who5");

            var who5Ques = new whoQuestion(req.query["date"], unparsedReq.authorEmail, unparsedReq.week
                , unparsedReq.questions);

            console.log(who5Ques);
            var query = { "week": who5Ques.week, "authorEmail": who5Ques.authorEmail };
            var found = await who5.findOne(query);
            if (found != undefined) {
                console.log(`Already found entry for author and week | ${query}`)
                res.send(500, { result: `Already found entry for author and week`, query: query });
            }
            else {
                const result = await who5.insertOne(who5Ques);
                console.log(`Insert sucessfull | ${result}`)
                res.send(200, { msg: "Insert sucessfull", result: result });
            }

        } catch (erro) {
            res.send(500, erro);
        }
    })

server.post("/productivity/question",
    async function (req, res, next) {
        var unparsedReq = req.body;
        const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        try {
            await client.connect();

            const producitivity = client.db(DATABASE_NAME).collection("productivity");

            var productivityQuestion = new whoQuestion(req.query["date"], unparsedReq.authorEmail, unparsedReq.week
                , unparsedReq.questions);

            console.log(productivityQuestion);
            var query = { "week": productivityQuestion.week, "authorEmail": productivityQuestion.authorEmail };
            var found = await producitivity.findOne(query);
            if (found != undefined) {
                console.log(`Already found entry for author and week | ${query}`)
                res.send(500, { result: `Already found entry for author and week | Productivity`, query: query });
            }
            else {
                const result = await producitivity.insertOne(productivityQuestion);
                console.log(`Insert sucessfull | ${result}`)
                res.send(200, { msg: "Insert sucessfull prod", result: result });
            }

        } catch (erro) {
            res.send(500, erro);
        }
    })

server.get("/commits/count",
    async function (req, res, next) {
        const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        await client.connect();

        let query = {}
        let response = {}
        if (req.query["useremail"] !== null || req.query["useremail"] !== "") {
            if (req.query["useremail"] != undefined)
            {   
                console.log(req.query["useremail"]);
                query["committer_email"] = req.query["useremail"]
                response["committer_email"] = req.query["useremail"]
            }
        }
        query["committed_date"] = {}
        if (req.query["since"] != null || req.query["since"] == "") {
            var sinceDate = new Date(req.query["since"]);
            if (sinceDate != undefined) {
                query["committed_date"]["$gte"] = sinceDate

            }
            else {
                query["committed_date"]["$gte"] = new Date("2020-01-01")
            }
        }
        else {
            query["committed_date"]["$gte"] = new Date("2020-01-01")
        }
        response["since"] = query["committed_date"]["$gte"]
        //
        if (req.query["until"] != null || req.query["until"] == "") {
            var untilDate = new Date(req.query["until"]);
            if (untilDate != undefined) {
                query["committed_date"]["$lt"] = untilDate

            }
            else {
                query["committed_date"]["$lt"] = new Date()
            }

        }
        else {
            query["committed_date"]["$lt"] = new Date()
        }
        response["until"] = query["committed_date"]["$lt"]
        //
        if (req.query["project"] == null || req.query["project"] == "") {
            try {

                var countallprojects = 0
                for (let index = 0; index < PROJIDS.length; index++) {
                    const proj = PROJIDS[index];
                    const commitsproject = client.db(proj["projectname"]).collection("commits");
                    //                    
                    console.log(query)
                    var count = await commitsproject.count(query);
                    response[proj["projectname"]] = count
                    countallprojects += count;
                    console.log(`${proj["projectname"]} --> ${count}`);
                }
                response["count"] = countallprojects
                res.send(200, response)
            }
            catch (erro) {
                throw erro
            }
        }
    }
)

server.post("/db/update",
    //TODO Process diff
    //TODO Process area
    //TODO Process author based on database
    //First we acess the gitlab API to GET the commits from the project
    async function (req, res, next) {
        console.log("Receiving data from the Gitlab API");
        if (req.query["since"] == undefined || req.query["until"] == undefined) {
            res.send(400, "Need since date and until date");
        }
        if (req.query["project"] == "") {
            res.send(400, "Need project name: skycaravan,epc or terrapulse");
        }
        if (GetProject(req.query["project"]) == null) {
            res.send(400, "Need project name: skycaravan,epc or terrapulse");
        }
        else {
            req.project = GetProject(req.query["project"])
            console.log(req.project)
        }
        req.body = await GetCommitsFromGitLab(req.query["since"], req.query["until"], 1, null, req.project);
        if (req.body != null) {
            return next();
        }
    },
    //This checks the diffs
    async function (req, res, next) {
        if (req.body == undefined) {
            res.send(400, "PushCommits undefined");
        }
        try {
            for (let c = 0; c < req.body.length; c++) {

            }
        } catch (erro) {
            console.log(erro);
            return next(erro);
        }
        return next();
    },
    async function (req, res, next) {
        console.log("Parsing commit to internal class");
        var pushCommits = req.body;
        var listofCommits = [];
        var commitDiffs = [];
        var codeFiles = [];
        var codeDiffs = [];
        var sumAdditions = 0;
        var sumDeletions = 0;
        try {
            for (let i = 0; i < pushCommits.length; i++) {
                var readCommit = pushCommits[i];
                commitDiffs = []
                codeFiles = []
                console.log(`Getting diff from commit: ${readCommit.id}`);
                var requestOptions = defaultRequestToGitlab;
                requestOptions.params = [];
                await gitlabApi.get(`/v4/projects/${req.project["projectid"]}/repository/commits/${readCommit.id}/diff`, requestOptions)
                    .then(function (response) {
                        var alldiffs = response.data;

                        codeDiffs = []
                        sumAdditions = 0;
                        sumDeletions = 0;

                        console.log(`Diff files lenght: ${commitDiffs.length} || ${alldiffs.length} || ${codeDiffs.length}`);

                        for (let index = 0; index < alldiffs.length; index++) {
                            if (alldiffs[index]["new_path"].includes(".cs") || alldiffs[index]["new_path"].includes(".csv") || alldiffs[index]["new_path"].includes(".json")) {
                                codeFiles.push(alldiffs[index]["new_path"]);
                                codeDiffs.push(alldiffs[index]);
                            }
                            else {
                                commitDiffs.push(alldiffs[index]["new_path"]);
                            }
                        }

                        for (let j = 0; j < codeDiffs.length; j++) {
                            var countAdd = occurrences(codeDiffs[j]["diff"], "\n+");
                            var countDelete = occurrences(codeDiffs[j]["diff"], "\n-");

                            sumAdditions += countAdd;
                            sumDeletions += countDelete;
                        }

                        console.log(`Diff files lenght: ${commitDiffs.length} || ${alldiffs.length} || ${codeDiffs.length}`);
                        var newCommit = new commit(readCommit.id, readCommit.short_id, readCommit.title,
                            readCommit.committer_name, readCommit.committer_email,
                            readCommit.message, readCommit.committed_date, readCommit.stats, new Stats(sumAdditions, sumDeletions, sumAdditions + sumDeletions), commitDiffs, codeFiles);

                        listofCommits.push(newCommit);
                    });
            }
        } catch (erro) {
            console.log(erro);
            return next(erro);
        }
        req.commits = listofCommits;
        console.log(`Sucess parsing commits ${req.commits.length} to internal class`);
        return next();
    },

    async function (req, res, next) {
        console.log("Trying to add to Database");
        const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        try {
            await client.connect();

            const commits = client.db(req.project["projectname"]).collection("commits");
            // const result = await commits.updateMany(req.commits,  , { upsert: true });//TODO Use Update many with upsert
            var results = [];
            var commitsCount = 0;
            for (let ind = 0; ind < req.commits.length; ind++) {
                var query = { "_id": req.commits[ind]._id };
                var found = await commits.findOne(query);
                if (found != null) {
                    var alreadyFoundString = `Commit found already: ${found["_id"]}`;
                    console.log(alreadyFoundString);
                    results.push(alreadyFoundString);
                    commitsCount++;
                }
                else {

                    const result = await commits.insertOne(req.commits[ind]);
                    var addedString = `Saved new commit with _ID: ${result.insertedId}`;
                    console.log(addedString);
                    results.push(addedString);
                    commitsCount++;
                }
            }

            console.log("---------------");
            res.send(200, { commitCount: commitsCount, results: results });

        } catch (err) {
            //console.log(err);
            res.send(400, err);
        }
        finally {
            // Close the connection to the MongoDB cluster
            await client.close();
        }
    })

//TODO Change this to commit/all
server.get("/db/commits/all",
    async function (req, res, next) {
        const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        try {
            await client.connect();

            const commits = client.db(DATABASE_NAME).collection("commits");
            // perform actions on the collection object
            var query = {};
            var cursor = commits.find(query);

            const results = await cursor.toArray();
            console.log(`Total count of DB: ${results.length}`);
            res.send(200, results);
        } catch
        {
            res.send(400, { data: [] });
        }
        finally {
            // Close the connection to the MongoDB cluster
            await client.close();
        }
    })

server.get("/db/who5/all",
    async function (req, res, next) {
        const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        try {
            await client.connect();

            const who5 = client.db(DATABASE_NAME).collection("who5");
            // perform actions on the collection object
            var query = {};
            var cursor = who5.find(query);

            const results = await cursor.toArray();
            console.log(`Total count of WHO5 DB: ${results.length}`);
            res.send(200, results);
        }
        catch (err) {
            res.send(400, err.message);
        }
        finally {
            // Close the connection to the MongoDB cluster
            await client.close();
        }
    })

server.get("/db/productivity/all",
    async function (req, res, next) {
        const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        try {
            await client.connect();

            const productivity = client.db(DATABASE_NAME).collection("productivity");
            // perform actions on the collection object
            var query = {};
            var cursor = productivity.find(query);

            const results = await cursor.toArray();
            console.log(`Total count of Productivity DB: ${results.length}`);
            res.send(200, results);
        } catch
        {
            res.send(400, { data: [] });
        }
        finally {
            // Close the connection to the MongoDB cluster
            await client.close();
        }
    })

server.get("/db/users/all",
    async function (req, res, next) {
        const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        try {
            await client.connect();

            const users = client.db(DATABASE_NAME).collection("users");
            // perform actions on the collection object
            var query = {};
            var cursor = users.find(query);

            const results = await cursor.toArray();
            console.log(`Total count of USERS DB: ${results.length}`);
            res.send(200, results);
        } catch
        {
            res.send(400, "error getting users");
        }
        finally {
            // Close the connection to the MongoDB cluster
            await client.close();
        }
    })

server.
    server.listen(port, () => {
        console.log(`${SERVER_NAME} server is running on ${port}`);
    })

server.get("/commit/diff",
    async function (req, res, next) {
        var commitDiffs = [];
        try {

            console.log(`Getting diff from commit: ${req.query["commitsha"]}`);
            var requestOptions = defaultRequestToGitlab;
            requestOptions.params = [];
            await gitlabApi.get(`/v4/projects/${req.query["projectid"]}/repository/commits/${req.query["commitsha"]}/diff`, requestOptions)
                .then(function (response) {
                    var alldiffs = response.data;

                    for (let index = 0; index < alldiffs.length; index++) {
                        if (alldiffs[index]["new_path"].includes(".cs")) {
                            commitDiffs.push(alldiffs[index]);
                        }
                    }
                    for (let j = 0; j < commitDiffs.length; j++) {
                        const commitDiff = commitDiffs[j];
                        var countAdd = occurrences(commitDiff["diff"], "\n+");
                        var countDelete = occurrences(commitDiff["diff"], "\n-");
                        var files = parseDiff(commitDiff);
                        console.log(files)
                        commitDiff["Add"] = countAdd;
                        commitDiff["Deletions"] = countDelete;
                        commitDiff["Alterations"] = countAdd + countDelete;
                    }
                    console.log(`Diff files lenght: ${commitDiffs.length} || ${alldiffs.length}`);
                    res.send(200, commitDiffs)
                });
        }
        catch (erro) {
            console.log(erro);
            return next(erro);
        }
    })