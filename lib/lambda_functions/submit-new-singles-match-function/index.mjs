import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {PutCommand, DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const getRandomInt = () => {
  return Math.floor(Math.random() * 10000);
}
export const handler = async (event) => {
  let method = event.requestContext.http.method 
  
  if (method != 'POST'){
      return {
          'statusCode': 405,
      }
  }

  let body = JSON.parse(event.body)

  console.log('body: ' + JSON.stringify(body))

  const leagueId = body['leagueId']
  const matchFormat = body['matchFormat']
  const matchDay = body['matchDay']
  const matchMonth = body['matchMonth']
  const matchYear = body['matchYear']

  const matchWinner = body['matchWinner']
  const matchLoser = body['matchLoser']

  const set1WinnerScore = body['set1WinnerScore']
  const set1LoserScore = body['set1LoserScore']

  const set2WinnerScore = body['set2WinnerScore']
  const set2LoserScore = body['set2LoserScore']

  if ( !leagueId || !matchFormat || !matchDay || !matchMonth || !matchWinner || !matchLoser || !set1WinnerScore || 
    !set1LoserScore || !set2WinnerScore || !set2LoserScore) {
      return {
        'statusCode': 400
      }
  }

  const matchId = leagueId + matchWinner + matchLoser + matchDay + matchMonth + matchYear + getRandomInt()

  console.log("matchId: " + matchId)
  
  let item = {
    matchId: matchId,
    leagueId: leagueId,
    matchFormat: matchFormat,
    matchDay: matchDay,
    matchMonth: matchMonth,
    matchYear: matchYear,
    matchWinner: matchWinner,
    matchLoser: matchLoser,
    set1WinnerScore: set1WinnerScore,
    set1LoserScore: set1LoserScore,
    set2WinnerScore: set2WinnerScore,
    set2LoserScore: set2LoserScore
  }

  if (matchFormat !== '2sets') {
    const set1Winner = body['set1Winner']
    const set1Loser = body['set1Loser']
    const set2Winner = body['set2Winner']
    const set2Loser = body['set2Loser']

    if (!set1Winner || !set1Loser || !set2Winner || !set2Loser) {
      return {
        'statusCode': 400
      } 
    }

    item.set1Winner = set1Winner;
    item.set1Loser = set1Loser;
    item.set2Winner = set2Winner;
    item.set2Loser = set2Loser;

    if (matchFormat === '3sets') {
      const set3WinnerScore = body['set3WinnerScore']
      const set3LoserScore = body['set3LoserScore']

      if (!set3WinnerScore || !set3LoserScore) {
        return {
          'statusCode': 400
        } 
      }

      item.set3Winner = matchWinner;
      item.set3Loser = matchLoser;
      item.set3WinnerScore = set3WinnerScore;
      item.set3LoserScore = set3LoserScore;

    } else if (matchFormat === 'tiebreaker') {
      const tiebreakerWinnerScore = body['tiebreakerWinnerScore']
      const tiebreakerLoserScore = body['tiebreakerLoserScore']

      if (!tiebreakerWinnerScore || !tiebreakerLoserScore) {
        return {
          'statusCode': 400
        } 
      }

      item.tiebreakerWinner = matchWinner;
      item.tiebreakerLoser = matchLoser;
      item.tiebreakerWinnerScore = tiebreakerWinnerScore;
      item.tiebreakerLoserScore = tiebreakerLoserScore;

    } else {
      return {
        'statusCode': 400
      } 
    }

  } else {
    item.set1Winner = matchWinner;
    item.set1Loser = matchLoser;
    item.set2Winner = matchWinner;
    item.set2Loser = matchLoser;
  }

  const command = new PutCommand({
    TableName: "BreakPointSinglesMatchesTable",
    Item: item
  });

  const ddbResponse = await docClient.send(command);
    
  console.log(ddbResponse)

  var functionResponse = {
    statusCode: 200,
  };

  return functionResponse;

}