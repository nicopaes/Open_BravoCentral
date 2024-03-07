using BravoCentral.Data;

public class Settings
{
    public User currentUser;
    public bool anonMode;

    public Settings(User currentUser)
    {
        this.currentUser = currentUser;
        this.anonMode = false;
    }
}