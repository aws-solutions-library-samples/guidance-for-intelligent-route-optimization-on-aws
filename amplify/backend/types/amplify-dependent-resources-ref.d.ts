export type AmplifyDependentResourcesAttributes = {
    "auth": {
        "awssupplychaindemo6b91e579": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolArn": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string"
        }
    },
    "geo": {
        "supplychainmap": {
            "Name": "string",
            "Style": "string",
            "Region": "string",
            "Arn": "string"
        },
        "supplychainplace": {
            "Name": "string",
            "Region": "string",
            "Arn": "string"
        }
    },
    "api": {
        "awssupplychaindemo": {
            "GraphQLAPIIdOutput": "string",
            "GraphQLAPIEndpointOutput": "string"
        }
    },
    "function": {
        "awssupplychaindemopowertools": {
            "Arn": "string"
        },
        "deviceSimulatorFn": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "routeOptimizerFn": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "iotUpdateTrackerFn": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "startItineraryFn": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "getDevicePositionFn": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        }
    }
}