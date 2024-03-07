export default class WhoQuestion
{
    constructor(date,authorEmail,week,questions)
    {
        this.date = new Date(date);            
        this.authorEmail = authorEmail;
        this.week = week;    
        this.questions = questions;
    }
}