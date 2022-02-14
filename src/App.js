import { BrowserRouter as Router, Routes, Route} from "react-router-dom";

// Eyes Pages
import EyePage from './Pages/eyeselect';
import EyesImageDetect from "./Pages/eyesimagedetect";
import EyesRealTimeDetect from "./Pages/eyesrealtimedetect";

// Horn Pages
import HornPage from './Pages/hornselect';
import HornsImageDetect from "./Pages/hornsimagedetect";
import HornsRealtimeDetect from "./Pages/hornsrealtimedetect";

// Mouth Pages
import MouthPage from './Pages/mouthselect';
import MouthImageDetect from './Pages/mouthimagedetect';
import MouthRealTimeDetect from './Pages/mouthrealtimedetect';

// Ears Pages
import EarPage from './Pages/earselect';
import EarImageDetect from './Pages/earimagedetect';
import EarRealTimeDetect from './Pages/earrealtimedetect';

// Back Pages
import BackPage from './Pages/backselect';
import BackImageDetect from './Pages/backimagedetect';
import BackRealTimeDetect from './Pages/backrealtimedetect';

// Tail Pages
import TailPage from './Pages/tailselect';
import TailImageDetect from './Pages/tailimagedetect';
import TailRealTimeDetect from './Pages/tailrealtimedetect'

// Utility Page
import PartSelect from './Pages/partselect';
import ErrorPage from './Pages/missingpage';


function App (){
    return(
        <Router>
            <Routes>
                <Route path="/" element={<PartSelect/>}/>
                <Route path="/eyeselect" element={<EyePage/>}/>
                <Route path="/backselect" element={<BackPage/>}/>
                <Route path="/earselect" element={<EarPage/>}/>
                <Route path="/mouthselect" element={<MouthPage/>}/>
                <Route path="/tailselect" element={<TailPage/>}/>
                <Route path="/hornselect" element={<HornPage/>}/>
                <Route path="/eyesimagedetect" element={<EyesImageDetect/>}/>
                <Route path="/hornsimagedetect" element={<HornsImageDetect/>}/>
                <Route path="/hornsrealtimedetect" element={<HornsRealtimeDetect/>}/>
                <Route path="/eyesrealtimedetect" element={<EyesRealTimeDetect/>}/>
                <Route path="/mouthimagedetect" element={<MouthImageDetect/>}/>
                <Route path="/mouthrealtimedetect" element={<MouthRealTimeDetect/>}/>
                <Route path="/backimagedetect" element={<BackImageDetect/>}/>
                <Route path="/backrealtimedetect" element={<BackRealTimeDetect/>}/>
                <Route path="/earimagedetect" element={<EarImageDetect/>}/>
                <Route path="/earrealtimedetect" element={<EarRealTimeDetect/>}/>
                <Route path="/tailimagedetect" element={<TailImageDetect/>}/>
                <Route path="/tailrealtimedetect" element={<TailRealTimeDetect/>}/>
                <Route path="*" element={<ErrorPage/>}/>
            </Routes>
        </Router>
    )
}

export default App;