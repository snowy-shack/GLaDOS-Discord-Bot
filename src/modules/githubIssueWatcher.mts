import { getClient } from "#src/core/client.mts";
import { globalFields, getGlobalField, setGlobalField } from "#src/modules/localStorage.mts";
import { tryCatch, toError } from "#src/core/try-catch.mts";
import * as logs from "#src/core/logs.mts";

const ISSUE_API_URL = "https://api.github.com/repos/TeamDiopside/InfinityButtons/issues/10";
const ISSUE_URL = "https://github.com/TeamDiopside/InfinityButtons/issues/10";
const NOTIFY_USER_ID = "434759062614310922";

export async function checkInfinityButtonsIssue10() {
    if (getGlobalField(globalFields.Github.InfinityButtonsIssue10Notified)) return;

    const { data, error } = await tryCatch<{ state: string }>(
        fetch(ISSUE_API_URL).then((res) => res.json())
    );

    if (error) {
        await logs.logError("checking InfinityButtons issue #10", toError(error));
        return;
    }

    if (data.state === "open") return;

    const client = getClient();
    const { data: user, error: userError } = await tryCatch(client.users.fetch(NOTIFY_USER_ID));

    if (userError) {
        await logs.logError("fetching user for InfinityButtons issue #10 notification", toError(userError));
        return;
    }

    await user.send(`Issue #10 (${ISSUE_URL}) is closed, please work on it.`);
    await setGlobalField(globalFields.Github.InfinityButtonsIssue10Notified);
    await logs.logMessage(`📨 Notified <@${NOTIFY_USER_ID}> that InfinityButtons issue #10 is closed.`);
}

export default { checkInfinityButtonsIssue10 };
