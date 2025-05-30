import * as Nock from "nock";
import CodePushRenameDeploymentCommand from "../../../../src/commands/codepush/deployment/rename";
import { CommandArgs, CommandFailedResult, ErrorCodes } from "../../../../src/util/commandline";
import { expect } from "chai";
import { getFakeParamsForRequest } from "../utils";

describe("codepush deployment rename tests", () => {
  const app = "bogus/NameApp";
  const deployment = "bogusDeployment";
  const goldenPathArgs: CommandArgs = {
    args: ["--app", app, deployment, "newDeploymentName", "--token", getFakeParamsForRequest().token],
    command: ["codepush", "deployment", "rename"],
    commandPath: "fake/path",
  };

  it("should rename the deployment", async function () {
    // Arrange
    const renameCommand = new CodePushRenameDeploymentCommand(goldenPathArgs);
    Nock("https://api.appcenter.megaads.fun/").patch(`/v0.1/apps/${app}/deployments/${deployment}`).reply(204, {});

    // Act
    const result = await renameCommand.execute();

    // Assert
    expect(result.succeeded).to.be.true;
  });

  it("should output error when it fails with 404", async function () {
    // Arrange
    const renameCommand = new CodePushRenameDeploymentCommand(goldenPathArgs);
    Nock("https://api.appcenter.megaads.fun/").patch(`/v0.1/apps/${app}/deployments/${deployment}`).reply(404, {});

    // Act
    const result = await renameCommand.execute();

    // Assert
    expect((result as CommandFailedResult).errorCode).to.be.equal(ErrorCodes.NotFound);
    expect((result as CommandFailedResult).errorMessage).contains("does not exist");
  });

  it("should output error when it fails with 409", async function () {
    // Arrange
    const renameCommand = new CodePushRenameDeploymentCommand(goldenPathArgs);
    Nock("https://api.appcenter.megaads.fun/").patch(`/v0.1/apps/${app}/deployments/${deployment}`).reply(409, {});

    // Act
    const result = await renameCommand.execute();

    // Assert
    expect((result as CommandFailedResult).errorCode).to.be.equal(ErrorCodes.Exception);
    expect((result as CommandFailedResult).errorMessage).contains("already exists");
  });

  it("should output error when it fails with another error", async function () {
    // Arrange
    const renameCommand = new CodePushRenameDeploymentCommand(goldenPathArgs);
    const errorMessage = "Some error message";
    Nock("https://api.appcenter.megaads.fun/").patch(`/v0.1/apps/${app}/deployments/${deployment}`).reply(401, errorMessage);

    // Act
    const result = await renameCommand.execute();

    // Assert
    expect((result as CommandFailedResult).errorCode).to.be.equal(ErrorCodes.Exception);
    expect((result as CommandFailedResult).errorMessage).to.be.equal(errorMessage);
  });
});
