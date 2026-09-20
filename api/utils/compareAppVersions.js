export function compareAppVersions(sysVersion, userVersion) {
    if (sysVersion === userVersion) return 0

    if (sysVersion.split(".")[0] < userVersion.split(".")[0] || 
        (sysVersion.split(".")[0] === userVersion.split(".")[0] &&
        sysVersion.split(".")[1] < userVersion.split(".")[1]) ||
        (sysVersion.split(".")[0] === userVersion.split(".")[0] &&
        sysVersion.split(".")[1] === userVersion.split(".")[1] &&
        sysVersion.split(".")[2] < userVersion.split(".")[2])
    ) return -1

    return 1
}