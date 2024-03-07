export default class Commit
{
    constructor(_id,short_id,title,committer_name,committer_email,message,committed_date,stats,stats_codeonly,changed_files,changed_codefiles)
    {
        this._id = _id;
        this.short_id = short_id;        
        this.title = title;
        this.committer_name = committer_name;
        this.committer_email = committer_email;        
        this.message = message;
        this.committed_date = new Date(committed_date);
        this.stats = stats;
        this.stats_codeonly = stats_codeonly;
        this.changed_files = changed_files;
        this.changed_codefiles = changed_codefiles;
    }
}