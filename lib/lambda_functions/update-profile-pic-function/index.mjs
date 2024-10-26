import {
    S3Client,
    PutObjectCommand,
  } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const PROFILE_PIC_BUCKET_NAME = 'break-point-profile-pic-bucket';

export const handler = async (event) => {

    var method = event.requestContext.http.method 
  
    if (method != 'POST'){
        return {
            'statusCode': 405,
        }
    }

    var body = JSON.parse(event.body)
    
    console.log('body: ' + JSON.stringify(body))

    var cognitoId = body['cognitoId']
    var fileName = 'profile_pic.jpg'

    if (!cognitoId) {
        return {
            statusCode: 400
        }
    }

    const presignedUrl = await createPresignedPutURL({
        bucket: PROFILE_PIC_BUCKET_NAME,
        key: `${cognitoId}/${fileName}`,
        contentType: "image/jpeg",
    });
    
    console.log(presignedUrl)

    var functionResponse = {
      statusCode: 200,
      body: JSON.stringify({ url: presignedUrl }),
    };

    return functionResponse;
  };

const createPresignedPutURL = ({ bucket, key, contentType }) => {
    const client = new S3Client({});
    // Expires in 15 minutes.
    const expiresIn = 15 * 60;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(client, command, { expiresIn });
  };