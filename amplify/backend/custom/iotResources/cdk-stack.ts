import * as cdk from "@aws-cdk/core";
import * as AmplifyHelpers from "@aws-amplify/cli-extensibility-helper";
import * as iot from "@aws-cdk/aws-iot";
import * as iam from "@aws-cdk/aws-iam";

export class cdkStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.StackProps,
    _amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps
  ) {
    super(scope, id, props);
    /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
    new cdk.CfnParameter(this, "env", {
      type: "String",
      description: "Current Amplify CLI env name",
    });

    /* AWS CDK code goes here - learn more: https://docs.aws.amazon.com/cdk/latest/guide/home.html */

    // Identifier for the IoT Core Certificate, REPLACE THIS WITH YOUR CERTIFICATE ID
    const CERTIFICATE_ID = "[YOUR_CERTIFICATE_ID]";

    // Create an IoT Core Policy
    const policy = new iot.CfnPolicy(this, "Policy", {
      policyName: "trackPolicy",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "iot:Connect",
            Resource: `arn:aws:iot:${cdk.Stack.of(this).region}:${
              cdk.Stack.of(this).account
            }:client/trackerThing`,
          },
          {
            Effect: "Allow",
            Action: "iot:Publish",
            Resource: `arn:aws:iot:${cdk.Stack.of(this).region}:${
              cdk.Stack.of(this).account
            }:topic/iot/trackedAssets`,
          },
        ],
      },
    });

    // Attach the certificate to the IoT Core Policy
    const policyPrincipalAttachment = new iot.CfnPolicyPrincipalAttachment(
      this,
      "MyCfnPolicyPrincipalAttachment",
      {
        policyName: policy.policyName,
        principal: `arn:aws:iot:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:cert/${CERTIFICATE_ID}`,
      }
    );
    policyPrincipalAttachment.addDependsOn(policy);

    // Create an IoT Core Thing
    const thing = new iot.CfnThing(this, "Thing", {
      thingName: "trackerThing",
    });

    // Attach the certificate to the IoT Core Thing
    const thingPrincipalAttachment = new iot.CfnThingPrincipalAttachment(
      this,
      "MyCfnThingPrincipalAttachment",
      {
        principal: `arn:aws:iot:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:cert/${CERTIFICATE_ID}`,
        thingName: thing.thingName,
      }
    );
    thingPrincipalAttachment.addDependsOn(thing);

    // IAM Role for AWS IoT Core to publish to Location Service
    const role = new iam.Role(this, "iot-tracker-role", {
      assumedBy: new iam.ServicePrincipal("iot.amazonaws.com"),
      description: "IAM Role that allows IoT Core to update a Tracker",
      inlinePolicies: {
        allowTracker: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              resources: [
                `arn:aws:geo:${cdk.Stack.of(this).region}:${
                  cdk.Stack.of(this).account
                }:tracker/tracker_location_workshop`,
              ],
              actions: ["geo:BatchUpdateDevicePosition"],
            }),
          ],
        }),
      },
    });

    // Create an IoT Topic Rule that will send the location updates to Location Service
    const topicRule = new iot.CfnTopicRule(this, "TopicRule", {
      ruleName: "assetTrackingRule",
      topicRulePayload: {
        sql: `SELECT * FROM 'iot/trackedAssets'`,
        awsIotSqlVersion: "2016-03-23",
        actions: [],
      },
    });

    topicRule.addOverride("Properties.TopicRulePayload.Actions.0", {
      Location: {
        DeviceId: "${deviceID}",
        Latitude: "${longitude}",
        Longitude: "${latitude}",
        RoleArn: role.roleArn,
        Timestamp: {
          Value: "${timestamp()}",
          Unit: "MILLISECONDS",
        },
        TrackerName: "tracker_location_workshop",
      },
    });
  }
}
