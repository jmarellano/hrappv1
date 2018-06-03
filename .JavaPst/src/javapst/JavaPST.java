package javapst;
import com.pff.*;
import java.util.*;
import com.mongodb.client.model.Filters;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoCollection;
import org.bson.Document;
import org.bson.conversions.Bson;
import com.mongodb.client.model.UpdateOptions;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.io.InputStream;
import java.io.FileOutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.logging.Logger;
import java.util.logging.FileHandler;
import java.util.logging.SimpleFormatter;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
/**
 *
 *
 * @author jmarellano
 */
public class JavaPST {
    public String contact = "";
    public static void main(String[] args) throws Exception {
        new JavaPST(args);
    }
    public JavaPST(String[] args) throws Exception{
        try {
            PSTFile pstFile = new PSTFile(args[0]);
            MongoClient mongoClient = new MongoClient("127.0.0.1", Integer.parseInt("9001"));
            MongoDatabase database = mongoClient.getDatabase("hrapp");
            MongoCollection<Document> messages = database.getCollection("messages");
            MongoCollection<Document> candidates = database.getCollection("candidates");
            System.out.println(pstFile.getMessageStore().getDisplayName());
            this.contact = pstFile.getMessageStore().getDisplayName();
            processFolder(pstFile.getRootFolder(), messages, candidates);
        } catch (Exception err) {
            err.printStackTrace();
        }
    }
    int depth = -1;
    public void processFolder(PSTFolder folder,MongoCollection<Document> messages,MongoCollection<Document> candidates)
            throws PSTException, java.io.IOException
    {
        depth++;
        // the root folder doesn't have a display name
        if (depth > 0) {
            printDepth();
            System.out.println(folder.getDisplayName());
        }

        // go through the folders...
        if ((
                folder.getDisplayName().length() == 0 ||
                "Top of Outlook data file".equals(folder.getDisplayName()) ||
                "Inbox".equals(folder.getDisplayName()) ||
                "Sent Items".equals(folder.getDisplayName()) 
            ) && folder.hasSubfolders()) {
            Vector<PSTFolder> childFolders = folder.getSubFolders();
            for (PSTFolder childFolder : childFolders) {
                if(
                    childFolder.getDisplayName().length() == 0 ||
                    "Top of Outlook data file".equals(childFolder.getDisplayName()) ||
                    "Inbox".equals(childFolder.getDisplayName()) ||
                    "Sent Items".equals(childFolder.getDisplayName()) 
                ){
                    processFolder(childFolder, messages, candidates);
                }
                   
            }
        }

        // and now the emails for this folder
        if ((
                "Inbox".equals(folder.getDisplayName()) ||
                "Sent Items".equals(folder.getDisplayName()) ||
                depth > 2
            ) && folder.getContentCount() > 0) {
            depth++;
            PSTMessage email = (PSTMessage)folder.getNextChild();
            while (email != null) {
                printDepth();
                System.out.println("Importing: "+email.getInternetMessageId());
                Date date = email.getMessageDeliveryTime();
                boolean read = email.isRead();
                String contact = "";
                String from = "";
                String to = "";
                int status = 0;
                if(this.contact == email.getSenderEmailAddress()){
                    from = email.getSenderEmailAddress();
                    to = email.getReceivedByAddress();
                    contact = email.getReceivedByAddress();
                    status = 2;
                } else {
                    to = email.getSenderEmailAddress();
                    from = email.getReceivedByAddress();
                    contact = email.getSenderEmailAddress();
                    status = 1;
                }
                String cc = email.getDisplayCC();
                String bcc = email.getDisplayBCC();
                String html = email.getBodyHTML();
                String text = email.getBody();
                String subject = email.getSubject();
                email = (PSTMessage)folder.getNextChild();
                Document doc = new Document("createdAt", date.getTime())
                    .append("read", read)
                    .append("contact", contact)
                    .append("from", from)
                    .append("to", to)
                    .append("cc",cc)
                    .append("bcc", bcc)
                    .append("html", html)
                    .append("text", text)
                    .append("subject", subject)
                    .append("type", 1)
                    .append("status", status)
                    .append("attachments", Arrays.asList())
                    .append("messageId", email.getInternetMessageId());
                Document subDoc = new Document("createdAt", date.getTime())
                    .append("read", read)
                    .append("contact", contact)
                    .append("from", from)
                    .append("to", to)
                    .append("text", text)
                    .append("subject", subject);
                try{
                    messages.insertOne(doc);
                    Bson filter = Filters.eq("contact", contact);
                    Bson update =  new Document("$set",
                                  new Document()
                                        .append("lastMessage", subDoc))
                                    .append("$setOnInsert",
                                  new Document()
                                        .append("contact",contact)
                                        .append("retired",0)
                                        .append("createdAt", System.currentTimeMillis() * 1000L));
                    UpdateOptions options = new UpdateOptions().upsert(true);
                    candidates.updateOne(filter, update, options);
                }catch(Exception err){
                   System.out.println("Error Insert collection: "+email.getDescriptorNodeId()+ " Error:" + err);  
                }
            }
            depth--;
        }
        depth--;
    }

    public void printDepth() {
        for (int x = 0; x < depth-1; x++) {
            System.out.print(" | ");
        }
        System.out.print(" |- ");
    }
}
