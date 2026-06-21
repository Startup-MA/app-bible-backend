export const datePrettify = (rawDate) => {
    const dateArray = new Date(rawDate).toDateString().split(" ").slice(1)

    return dateArray[0] + " " + dateArray[1] + ", " + dateArray[2]
} 