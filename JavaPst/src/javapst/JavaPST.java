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
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.logging.Logger;
import java.util.logging.FileHandler;
import java.util.logging.SimpleFormatter;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.security.MessageDigest;
/**
 *
 *
 * @author jmarellano
 */
public class JavaPST {
    public String contact = "";
    public int count = 0;
    public int folderC = 0;
    private static Logger logger = Logger.getLogger("log");
    private static MessageDigest md = null;
    private static String userId = "";
    public static void main(String[] args) throws Exception {
        new JavaPST(args);
    }
    public JavaPST(String[] args) throws Exception{
        try {
            PSTFile pstFile = new PSTFile(args[0]);
            MongoClient mongoClient = new MongoClient("67.205.159.172", Integer.parseInt("9001"));
            MongoDatabase database = mongoClient.getDatabase("hrapp");
            MongoCollection<Document> messages = database.getCollection("messages");
            MongoCollection<Document> appointments = database.getCollection("appointments");
            MongoCollection<Document> contacts = database.getCollection("contacts");
            MongoCollection<Document> candidates = database.getCollection("candidates");
            md = MessageDigest.getInstance("MD5");
            userId = args[1];
            this.contact = pstFile.getMessageStore().getDisplayName();
            processFolder(pstFile.getRootFolder(), messages, candidates, appointments, contacts);
        } catch (Exception err) {
            err.printStackTrace();
        }
    }
    public void processFolder(PSTFolder folder,MongoCollection<Document> messages,MongoCollection<Document> candidates, MongoCollection<Document> appointments, MongoCollection<Document> contacts)
            throws PSTException, java.io.IOException
    {
        folderC++;
        // go through the folders...
        if (folder.hasSubfolders()) {
            Vector<PSTFolder> childFolders = folder.getSubFolders();
            for (PSTFolder childFolder : childFolders) {
                    processFolder(childFolder, messages, candidates, appointments, contacts);
            }
        }
        // and now the emails for this folder
        if (folder.getContentCount() > 0) {
            PSTMessage email = (PSTMessage)folder.getNextChild();
            while (email != null) {
                String type = " "+email.getMessageClass();
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
                String messageId = (date + to + subject + text + from);
                
                md.update(messageId.getBytes());
                byte byteData[] = md.digest();
                StringBuffer sb = new StringBuffer();
                for (int i = 0; i < byteData.length; i++) {
                 sb.append(Integer.toString((byteData[i] & 0xff) + 0x100, 16).substring(1));
                }
                messageId = sb.toString();
                Document query = new Document("messageId", messageId);
                if(messages.count(query) < 1 && appointments.count(query) < 1){
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
                        .append("messageId", messageId)
                        .append("attachments", Arrays.asList())
                        .append("importedBy", userId);

                    Document subDoc = new Document("createdAt", date.getTime())
                        .append("read", read)
                        .append("contact", contact)
                        .append("from", from)
                        .append("to", to)
                        .append("text", text)
                        .append("subject", subject);
                    try{
                        count++;
                        String tyype = "";
                        if(type.toLowerCase().contains("IPM.Note".toLowerCase())){
                            tyype = "messages";
                            messages.insertOne(doc);
                        } else if(type.toLowerCase().contains("IPM.Schedule.Meeting".toLowerCase())){
                            tyype = "appointments";
                            PSTAppointment appointment = (PSTAppointment)email;
                            doc.append("startTime", appointment.getStartTime());
                            doc.append("endTime", appointment.getEndTime());
                            appointments.insertOne(doc);
                        } else if(type.toLowerCase().contains("IPM.Appointment".toLowerCase())){
                            tyype = "appointments";
                            PSTAppointment appointment = (PSTAppointment)email;
                            doc.append("startTime", appointment.getStartTime());
                            doc.append("endTime", appointment.getEndTime());
                            appointments.insertOne(doc);
                        } else if(type.toLowerCase().contains("IPM.Contact".toLowerCase()))
                            contacts.insertOne(doc);
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
                        int numberOfAttachments = email.getNumberOfAttachments();
                        for (int x = 0; x < numberOfAttachments; x++){
                            try{
                                PSTAttachment attach = email.getAttachment(x);
                                InputStream attachmentStream = attach.getFileInputStream();
                                String filename = attach.getLongFilename();
                                String mime = attach.getMimeTag();
                                String attacht = attach.getLongFilename();
                                if (filename.isEmpty()) {
                                    filename = attach.getFilename();
                                    attacht = attach.getFilename();
                                }
                                long time = System.nanoTime();
                                FileOutputStream out = new FileOutputStream("/data/uploads/"+time+"-"+filename);
                                // 8176 is the block size used internally and should give the best performance
                                int bufferSize = 8176;
                                byte[] buffer = new byte[bufferSize];
                                int count = attachmentStream.read(buffer);
                                while (count == bufferSize) {
                                    out.write(buffer);
                                    count = attachmentStream.read(buffer);
                                }
                                if(count != -1){
                                    byte[] endBuffer = new byte[count];
                                    System.arraycopy(buffer, 0, endBuffer, 0, count);
                                    out.write(endBuffer);
                                    out.close();
                                    attachmentStream.close();
                                }

                                String url = "http://67.205.159.172.nip.io/pst?filename="+URLEncoder.encode(time+"-"+filename, "UTF-8")+"&id="+doc.get("_id")+"&time="+time+"&mime="+mime+"&type="+tyype;
                                URL obj = new URL(url);
                                HttpURLConnection con = (HttpURLConnection) obj.openConnection();
                                con.setRequestMethod("GET");
                                int responseCode = con.getResponseCode();
                            }catch(Exception err){
                             logger.info("Error Creating file: " + err);  
                            }
                        }
                    }catch(Exception err){
                       System.out.println("Error Insert collection: " + err);  
                    }
                }
                email = (PSTMessage)folder.getNextChild();
            }
        }
    }
}
