
        if(err){
           throw err;
        }
        res.json(info);
    });
});

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
 });

app.post('/post', uploadMiddleware.single('file'), async (req, res) =>{
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length-1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if(err){
           throw err;
        }
        const {title, summary, content} = req.body;
        const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id,
    });

    res.json(postDoc);
    });
});

app.put('/post',uploadMiddleware.single('file'), async(req, res) => {
    let newPath=null;
    if(req.file){
        const {originalname, path} = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length-1];
        newPath = path+'.'+ext;
        fs.renameSync(path, newPath);
    }

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if(err){
           throw err;
        }
        const {id, title, summary, content} = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);

        if(!isAuthor){
            return res.status(400).json('you are not the author')
        }

        await postDoc.update({
            title,
            summary, 
            content,
            cover: newPath ? newPath : postDoc.cover,
        });

    res.json(postDoc);
    });

});