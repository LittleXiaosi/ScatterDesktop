const {remote} = window.require('electron');
import {store} from '../store/store';
import * as Actions from '../store/constants';
import {BACKUP_STRATEGIES} from '../models/Settings';
import StorageService from '../services/StorageService';
const fs = window.require('fs');

const getLocation = () => remote.dialog.showOpenDialog({properties: ['openDirectory']});
const getLatestScatter = () => StorageService.getScatter();
const saveFile = (filepath) => {
    return new Promise(resolve => {
        const scatter = getLatestScatter();
        const date = new Date();
        const month = date.getUTCMonth();
        const year = date.getUTCFullYear();
        const salt = StorageService.getSalt();
        const file = scatter + '|SLT|' + salt;
        try {
            fs.writeFileSync(`${filepath}/scatter_${month}-${year}.txt`, file, 'utf-8');
            resolve(true);
        }
        catch(e) {
            console.error('Error saving file', e);
            resolve(false);
        }
    })
};

export default class BackupService {

    static async setBackupStrategy(strategy){
        const scatter = store.state.scatter.clone();
        scatter.settings.autoBackup = strategy;
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static async createBackup(){
        const location = getLocation();
        if(! location) return false;

        await saveFile(location[0]);
    }

    static async setBackupLocation(){
        const location = getLocation();
        if(!location) return false;
        const scatter = store.state.scatter.clone();
        scatter.settings.backupLocation = location[0];
        return store.dispatch(Actions.SET_SCATTER, scatter);
    }

    static async createAutoBackup(){
        if(!store.state.scatter || store.state.scatter.settings) return;
        const strategy = store.state.scatter.settings.autoBackup;
        if(!strategy || !strategy.length || strategy === BACKUP_STRATEGIES.MANUAL) return;

        const backupLocation = store.state.scatter.settings.backupLocation;
        if(!backupLocation || !backupLocation.length) return false;

        console.log('saving');

        await saveFile(backupLocation);
    }

}